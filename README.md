# Sonarqube CSV result exporter

## Note

This is a fork of https://github.com/erajakos/sonarqube-csv-exporter modified to read the input from STDIN instead of a file to allow for redirecting output from a cURL command.

## What is this?

This is a NodeJS script that groups all the issues in SonarQube result file (json) based on the rules
and occurrencies on components.

## Usage

Export SonarQube results in a json file running sonar scanner with following parameters.

```
-Dsonar.analysis.mode=preview -Dsonar.report.export.path=sonar-report.json
```

The report file is saved under .scannerwork folder

Export the csv

```
node path/to/sonar-report.json > sonar-report.csv
```
