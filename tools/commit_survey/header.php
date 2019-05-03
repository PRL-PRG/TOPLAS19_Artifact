<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style type="text/css">
      #bugtype {
        display:block;
      }

      #content {
        padding:2em;
      }

      #done {
        color:red;
      }

      #err {
        color:red;
        font-weight:bold;
      }

      #infodiv {
        background:#fff5e6;
        padding:0.5em;
      }

      #refdiv {
        background:#EBF5FB;
        padding:0.5em;
        margin-top:2em;
      }

      .block {
        margin-top:1em;
      }

      .clickable {
        text-decoration: underline;
        cursor: pointer;
        display: inline-block;
      }

      .showtypes {
        color:black;
      }

      .hidetypes {
        color:lightgray;
      }
    </style>
    <title>Commit</title>
    <script>
      var w = false;
      function popwindow(urllink) {
          w = window.open(urllink, urllink, "width=800,height=500");
      }
    
      function hidetypes() {
        var rbs = document.getElementsByName("type");
        var ts = document.getElementById("bugtype");
        var plvotes = document.getElementsByName("plvote");
        var emsg = document.getElementById("err");
        for(var i = 0; i < rbs.length; i++) {
          rbs[i].checked = false;
          rbs[i].disabled = true;
        }
        // for(var i = 0; i < rbs.length; i++) rbs[i].disabled = true;
        for(var i = 0; i < plvotes.length; i++) { 
          plvotes[i].checked = false; 
          plvotes[i].disabled = true;
        }      
        ts.style.color = "lightgray";
        emsg.innerHTML = "";
      }

      function showtypes() {
        var ts = document.getElementById("bugtype");
        ts.style.color = "black";
        var rbs = document.getElementsByName("type");
        var plvotes = document.getElementsByName("plvote");
        for(var i = 0; i < rbs.length; i++) rbs[i].disabled = false;      
        for(var i = 0; i < plvotes.length; i++) plvotes[i].disabled = false;
      }

      function submitTheForm(action) {
          let f = document.query;
          let ae = document.createElement("input");
          ae.type="text";
          ae.name=action;
          ae.value="1";
          ae.style.display = "none";
          f.appendChild(ae);
          if (w)
              w.close();
          f.submit();
      }
      
    </script>
</head>
