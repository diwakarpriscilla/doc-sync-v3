Feature: Demo-1 automated documentation sync and bookstore preview

  Scenario: CLI reports scanned files and creates redacted Markdown
    Given a temporary JavaScript project has a markerless README and a documented API route
    When the documentation sync CLI runs in the headed Playwright suite
    Then the captured report identifies the scanned source and updated documents
    And the generated Markdown preserves existing notes and redacts the configured secret marker

  Scenario: CLI default target resolves beside an isolated copy
    Given a temporary repository copy contains docSync.js and the bookstore project
    When the documentation sync CLI runs without a target argument in headed Playwright
    Then the CLI scans the copied bookstore project
    And the copied README human prefix remains unchanged

  Scenario: Bookstore HTML preview and book mutation use an isolated copy
    Given an isolated bookstore copy contains the Atomic Habits baseline fixture
    When I add the featured The Pragmatic Programmer fixture in headed Playwright
    Then the HTML preview displays the expected books and the new book survives reload
    And the repository catalog remains unchanged

  Scenario: Reset restores only an isolated bookstore fixture
    Given resetDemo.js and a temporary bookstore fixture are available
    When the Playwright reset check runs resetDemo.js against that fixture
    Then the fixture returns to its three-book baseline
    And the live bookstore catalog is not reset

  Scenario: Focused unit checks cover documentation sync behavior
    Given the documentation sync unit tests are available
    When the focused unit command runs
    Then marker, redaction, extraction, and target-folder checks pass
