<?php

  // Get file path for URLs' CSV
  function get_url_csv() {
    return $GLOBALS['CSV_PATH'] . $GLOBALS['TOKEN'] . ".csv";
  }

  // Get file path for answers' CSV
  function get_answers_csv() {
    return $GLOBALS['CSV_PATH'] . $GLOBALS['TOKEN'] . "out.csv";
  }

// Open CSV file and read into array
  function readCSV($csvFile) {
    $urlsfile = fopen($csvFile, "r");
    if (! $urlsfile)
        header('Location: error.php');
    while (!feof($urlsfile) && !empty($urlsfile)) {
      $rows[] = fgetcsv($urlsfile);
    }
    fclose($urlsfile);
    return $rows;
  }

  // Get the user's position in the CSV
  function calculate_pointer($ANSWERLENGTH, $rows) {
    $count = 0;
    for ($c = 0; $c < $ANSWERLENGTH; $c++) {
      if((int) count($rows[$c]) > 1) {
        $count++;
      } else {
        break;
      }
    }
    return $count;
  }

  session_start();
  $TOKEN;
  $CSV_IN;
  $CSV_OUT;
  $CSV_PATH = "../../commit_labels/";
  $DONEMSG = "";
  $ERRMSG = "";

  // Get hex for filename from GET token if first visit.
  // Store hex in SESSION variable for subsequent visits.
  if (isset($_GET["token"])) {
    $TOKEN = htmlspecialchars($_GET['token']);
    $_SESSION['token'] = $TOKEN;
    $CSV_IN = get_url_csv();
    $CSV_OUT = get_answers_csv();
  // If token not in GET, retrieve it from SESSION
  } else if (isset($_SESSION['token'])) {
    $TOKEN = $_SESSION['token'];
    $CSV_IN = get_url_csv();
    $CSV_OUT = get_answers_csv();
  } else {
    header('Location: error.php');
  }

  $ANSWERROWS = readCSV($CSV_OUT);
  $CSVROW;
  $ANSWERLENGTH = count($ANSWERROWS);
  $TOTALCOMMITS = count(readCSV($CSV_IN)) - 1;
  $POINTER = 0;
  $LINK;
  $BUGYES = 'unchecked';
  $BUGNO = 'unchecked';
  $TYPECOLOR;
  $TYPERADIO;

  // If user has clicked Next...
  // If Bug has not been selected:
  if (isset($_POST['next']) && !isset($_POST['bug'])) {
    $ERRMSG = "Please provide a Yes/No bug label.";
  }
 
  // Calculate which URL the user should be on.
  // Show first URL if FIRST button was hit.
  if (isset($_POST['first'])) {
    $POINTER = 0;
  }
  // Go to URL after the one previosly displayed  if Next was hit
  // and LATEST was NOT hit.
  else if (isset($_SESSION['pointer']) && !isset($_POST['latest'])) {
    // Go to URL before latest if Back was hit.
    $offset = (isset($_POST['back'])) ? 1 : 0;
    $POINTER = (int) $_SESSION['pointer'] - $offset;
    if ($POINTER < 0) { $POINTER = 0; }
  } else { // Go to last labeled URL otherwise (LATEST)
    $POINTER = calculate_pointer($ANSWERLENGTH, $ANSWERROWS);
  }

  // Get number of labels done for display
  $LABELSDONE = calculate_pointer($ANSWERLENGTH, $ANSWERROWS);

  // Check if form submitted and everything okay;
  // Write row to file, if so
  if (isset($_POST['next']) && ($ERRMSG == "")) {
    $file = fopen($CSV_OUT, "w");
    $ptr = (int) $_SESSION['pointer'];
    $count = 0;
    foreach ($ANSWERROWS as $row) {
      if ($row !== false) { // apparently there can be blank lines or return characters
        if ($count == (int) $ptr) {
          $newrow = array($row[0], $_POST['bug']);
          fputcsv($file, $newrow);
        }
        else {
          fputcsv($file, $row);
        }
        $count++;
      }
    }
    fclose($file);
    $POINTER++;
  }

  $ANSWERROWS = readCSV($CSV_OUT);
  $LABELSDONE = calculate_pointer($ANSWERLENGTH, $ANSWERROWS);

  // Don't let the pointer or counter get higher than the number of total commits
  if ($POINTER == $TOTALCOMMITS) $POINTER = $TOTALCOMMITS - 1; // the pointer should be 0 indexed
  if ($LABELSDONE >= $TOTALCOMMITS) $LABELSDONE = $TOTALCOMMITS; 

  $CSVROW = $ANSWERROWS[$POINTER]; // Get row from answer CSV
  $LINK = $CSVROW[0]; // Get the URL

  $_SESSION['pointer'] = $POINTER;

  // If commit already labeled, show info
  if (count($CSVROW) > 1) {
    $btype = $CSVROW[1];
    if ($btype == 0) {
      $BUGNO = 'checked';
    }
    else {
      $BUGYES = "checked";
    }
  }

  // Building the webpage
  include("header.php");

  echo "<html>\n<body>\n  <div id=\"content\">\n";

  // pointer is zero-indexed, so add 1. Then display number of current commit.
  echo sprintf("    <H1>Commit #%s:</H1>\n    <div class=\"block\" id=\"commit_url\">\n", 1 + (int) $POINTER);
  echo sprintf("    <H3>%s / %s commits labeled.</H3>\n", $LABELSDONE, $TOTALCOMMITS);

  // Clickable URL link
  echo sprintf("      <div class=\"clickable\" onclick=\"popwindow('%s');\">\n", $LINK) .
       $LINK . // url
       "\n      </div> <!-- end clickable -->\n";

  echo "    </div> <!-- end commit_url -->\n"; // close commit url div from body1

  include("labelform.php"); // The form for the labeling
  echo "</div> <!-- end content -->\n</body></html>";
?>


