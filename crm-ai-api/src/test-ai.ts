import { readFileSync, writeFileSync } from "fs";
import type { AITicket as Ticket, ConversationEntry, AIResponse } from "./types/domain";
import {
  MODEL_NAME,
  buildUserPrompt,
  callAI,
} from "./ai-service";

interface TestCase {
  id: string;
  name: string;
  description: string;
  expected_action: string;
  expected_fields: Record<string, unknown>;
  open_tickets_json: Ticket[];
  conversation_history: ConversationEntry[];
  latest_message: string;
}

interface TestResult {
  test_id: string;
  test_name: string;
  passed: boolean;
  expected_action: string;
  actual_action: string;
  expected_fields: Record<string, unknown>;
  actual_fields: Record<string, unknown>;
  ai_raw: AIResponse | null;
  errors: string[];
}

function evaluate(tc: TestCase, ai: AIResponse | null): TestResult {
  const errors: string[] = [];

  if (!ai) {
    return {
      test_id: tc.id,
      test_name: tc.name,
      passed: false,
      expected_action: tc.expected_action,
      actual_action: "error",
      expected_fields: tc.expected_fields,
      actual_fields: {},
      ai_raw: null,
      errors: ["AI returned null or unparseable response"],
    };
  }

  const exp = tc.expected_fields;

  if (tc.expected_action === "ambiguous") {
    if (ai.action !== "update" && ai.action !== "no_action") {
      errors.push(`Expected action 'update' or 'no_action' for ambiguous case, got '${ai.action}'`);
    }
  } else if (ai.action !== tc.expected_action) {
    errors.push(`Expected action '${tc.expected_action}', got '${ai.action}'`);
  }

  if (exp.category && ai.fields.category !== exp.category) {
    errors.push(`Expected category '${exp.category}', got '${ai.fields.category}'`);
  }

  if (exp.priority && ai.fields.priority !== exp.priority) {
    errors.push(`Expected priority '${exp.priority}', got '${ai.fields.priority}'`);
  }

  if (exp.status && ai.fields.status !== exp.status) {
    errors.push(`Expected status '${exp.status}', got '${ai.fields.status}'`);
  }

  if (exp.ticket_id && ai.ticket_id !== exp.ticket_id) {
    errors.push(`Expected ticket_id '${exp.ticket_id}', got '${ai.ticket_id}'`);
  }

  if (exp.resolution_detected !== undefined && ai.resolution_detected !== exp.resolution_detected) {
    errors.push(`Expected resolution_detected '${exp.resolution_detected}', got '${ai.resolution_detected}'`);
  }

  if (exp.match_confidence_min !== undefined && ai.match_confidence < (exp.match_confidence_min as number)) {
    errors.push(`Expected match_confidence >= ${exp.match_confidence_min}, got ${ai.match_confidence}`);
  }

  if (exp.match_confidence_max !== undefined && ai.match_confidence > (exp.match_confidence_max as number)) {
    errors.push(`Expected match_confidence <= ${exp.match_confidence_max}, got ${ai.match_confidence}`);
  }

  if (exp.entities) {
    const expectedEntities = exp.entities as string[];
    for (const e of expectedEntities) {
      if (!ai.fields.entities.includes(e)) {
        errors.push(`Expected entity '${e}' not found in AI response entities: ${JSON.stringify(ai.fields.entities)}`);
      }
    }
  }

  return {
    test_id: tc.id,
    test_name: tc.name,
    passed: errors.length === 0,
    expected_action: tc.expected_action,
    actual_action: ai.action,
    expected_fields: tc.expected_fields,
    actual_fields: {
      action: ai.action,
      ticket_id: ai.ticket_id,
      match_confidence: ai.match_confidence,
      reasoning: ai.reasoning,
      category: ai.fields.category,
      priority: ai.fields.priority,
      status: ai.fields.status,
      summary: ai.fields.summary,
      entities: ai.fields.entities,
      tags: ai.fields.tags,
      resolution_detected: ai.resolution_detected,
    },
    ai_raw: ai,
    errors,
  };
}

async function main() {
  const raw = readFileSync("TEST.json", "utf8");
  const testCases: TestCase[] = JSON.parse(raw);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`\n--- Running ${tc.id}: ${tc.name} ---`);
    const prompt = buildUserPrompt(tc.open_tickets_json, tc.conversation_history, tc.latest_message);
    const ai = await callAI(prompt);
    const result = evaluate(tc, ai);
    results.push(result);

    if (result.passed) {
      console.log(`✅ PASSED (action: ${result.actual_action})`);
      passed++;
    } else {
      console.log(`❌ FAILED`);
      result.errors.forEach((e) => console.log(`   - ${e}`));
      failed++;
    }

    if (ai) {
      console.log(`   Action: ${ai.action} | Confidence: ${ai.match_confidence} | Reasoning: ${ai.reasoning}`);
    }
  }

  const output = {
    summary: {
      total: testCases.length,
      passed,
      failed,
      timestamp: new Date().toISOString(),
      model: MODEL_NAME,
    },
    results,
  };

  const outPath = "TEST_RESULT.json";
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n=== Results written to ${outPath} ===`);
  console.log(`Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
}

main();
