    <div class="block" id="typeform">
      <H3>Is this a bug?</H3>
      <form method="post" action="commit_study.php" name="query">
        <label><input type="radio" name="bug" value=1 onclick="showtypes()" <?php print $BUGYES; ?>>Yes</label></br>
        <label><input type="radio" name="bug" value=0 onclick="hidetypes()" <?php print $BUGNO; ?>>No</label></br>
        <div id="err"><?php echo $ERRMSG; ?></div>
        <button onclick="submitTheForm('first')"> &lt;&lt; FIRST</button>
        <button onclick="submitTheForm('back')">Back</button>
        <button onclick="submitTheForm('next')">Next</button>
        <button onclick="submitTheForm('latest')">LATEST &gt;&gt;</button>
      </form>
    </div> <!-- end typeform -->
