const assert = require("assert");
const debug = require("debug");
const { writeFileSync } = require("fs");

assert.ok(process.env.PETIBRUGNON_INPUT_JSON_FILE_PATH);

const input = require(process.env.PETIBRUGNON_INPUT_JSON_FILE_PATH);
const logger = debug("root");

/**
 * @param {{ name: string, people: string[] }[]} input
 * @returns {string}
 */
function formatSolution(solution) {
  const projectLines = solution.flatMap(({ name, people }) => [
    name,
    people.join(" "),
  ]);
  return [Number(solution.length), ...projectLines].join("\n");
}

function writeOutput(content) {
  writeFileSync(process.env.PETIBRUGNON_OUTPUT_FILE_PATH, content);
}

writeOutput(formatSolution([]));
