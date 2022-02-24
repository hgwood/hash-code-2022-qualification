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

const contributorsBySkill = {}
for (const contributor of input.contributors) {
    for (const skill of contributor.skills) {
        if (!contributorsBySkill[skill.name]) {
            contributorsBySkill[skill.name] = [contributor]
        } else {
            contributorsBySkill[skill.name].push(contributor);
        }
    }
}


logger(JSON.stringify(contributorsBySkill));

const solution = [];
for (const project of input.projects) {
    const cast = [];
    for (let skill of project.skills) {
        const candidate = contributorsBySkill[skill.name]
            .find(c => c.skills.find(s => s.name === skill.name)?.level >= skill.level);
        if (candidate) cast.push(candidate.name);
    }
    if (cast.length == project.nroles)
        solution.push({ name: project.name, people: cast });
}

logger(JSON.stringify(solution));


writeOutput(formatSolution(solution));
