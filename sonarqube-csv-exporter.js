"use strict";

const fs = require("fs");
const { Parser } = require("json2csv");

const args = process.argv.slice(2);

if (args.length == 0) {
  console.error("Provide filepath to SonarQube json result file");
  process.exit(1);
}

const filePath = args[0];

fs.readFile(filePath, (err, data) => {
  if (err) {
    throw err;
  }

  const results = JSON.parse(data);

  if (!results.issues) {
    throw "No issues were found in the json file.";
  }

  const severityRank = ["INFO", "MINOR", "MAJOR", "CRITICAL", "BLOCKER"];
  const issues = results.issues.sort((a, b) => {
    const severityA = severityRank.indexOf(a.severity);
    const severityB = severityRank.indexOf(b.severity);

    if (severityB === severityA) {
      return a.message.toLowerCase() > b.message.toLowerCase() ? 1 : -1;
    } else {
      return severityB > severityA ? 1 : -1;
    }
  });
  const groupedIssues = groupIssuesByMessage(issues);
  const resultset = generateResultset(groupedIssues);

  const fields = ["message", "component", "severity"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(resultset);
  process.stdout.write(csv);
  process.exit();
});

function groupIssuesByMessage(issues) {
  return issues.reduce((r, a) => {
    r[a.message] = r[a.message] || [];
    r[a.message].push(a);
    return r;
  }, Object.create(null));
}

function generateResultset(groupedIssues) {
  const messages = Object.keys(groupedIssues);
  const resultset = messages.map(message => {
    return {
      message,
      component: findComponentOccurrences(groupedIssues[message]),
      severity: groupedIssues[message][0].severity
    };
  });
  return resultset;
}

function findComponentOccurrences(issues) {
  let occurrences = {};
  issues.forEach(issue => {
    if (!occurrences[issue.component]) {
      occurrences[issue.component] = [issue.line];
    } else {
      occurrences[issue.component].push(issue.line);
    }
  });

  const lines = Object.keys(occurrences).map(occurrence => {
    const lineNumbers = occurrences[occurrence].join(", ");
    const filename = occurrence.split(":")[1];
    return `* ${filename} : [${lineNumbers}]`;
  });

  return lines.join("\n");
}
