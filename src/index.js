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
    return [Number(solution.length || 0), ...projectLines].join("\n");
}

function writeOutput(content) {
    writeFileSync(process.env.PETIBRUGNON_OUTPUT_FILE_PATH, content);
}

const contributorsBySkill = {}
for (const contributor of input.contributors) {
    contributor.available = 0;
    for (const skill of contributor.skills) {
        if (!contributorsBySkill[skill.name]) {
            contributorsBySkill[skill.name] = [{contributor, skill}];
        } else {
            contributorsBySkill[skill.name].push({contributor, skill});
        }
    }
}


logger(JSON.stringify(contributorsBySkill));

function sortProjects(projects) {
    return projects.sort((a, b) => b.bestBefore - a.bestBefore);
    //return projects.sort((a, b) => a.score - b.score);
}

const solution = [];
for (const project of sortProjects(input.projects)) {
    const cast = new Set();
    for (let skill of project.skills) {
        const candidate = contributorsBySkill[skill.name]
            .filter(c => !cast.has(c.contributor.name))
            .filter(c => c.skill.level >= skill.level)
            .sort((a, b) => b.contributor.available - a.contributor.available)
            [0];
        if (candidate) {
            cast.add(candidate.contributor.name);
            if (skill.level == candidate.skill.level)
                candidate.skill.level++;
            candidate.contributor.available += project.ndays;
        }
    }
    if (cast.size == project.nroles)
        solution.push({ name: project.name, people: [...cast] });
}

logger(JSON.stringify(solution));


writeOutput(formatSolution(solution));
