
function exportJson() {
    var podfileContent = document.getElementById('podfileInput').value;
    var jsons = parsePodfile(podfileContent);
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsons));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "podfile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }