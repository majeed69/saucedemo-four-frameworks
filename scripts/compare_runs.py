import sys
import xml.etree.ElementTree as ET
from pathlib import Path

FRAMEWORKS = ["selenium", "playwright", "cypress", "webdriverio"]


def summarize(junit_file):
    cases = list(ET.parse(junit_file).iter("testcase"))
    passed = [c for c in cases if not any(c.find(tag) is not None for tag in ("failure", "error", "skipped"))]
    # sum of test case times, so every framework is measured the same way
    # (their own totals include different amounts of startup)
    duration = sum(float(c.get("time", 0)) for c in cases)
    return len(cases), len(passed), duration


def main(results_dir):
    print("| Framework | Tests | Passed | Test time (s) |")
    print("|---|---|---|---|")
    for framework in FRAMEWORKS:
        junit_file = Path(results_dir) / f"junit-{framework}" / "junit.xml"
        if not junit_file.exists():
            print(f"| {framework} | no report | | |")
            continue
        tests, passed, duration = summarize(junit_file)
        print(f"| {framework} | {tests} | {passed} | {duration:.1f} |")


if __name__ == "__main__":
    main(sys.argv[1])
