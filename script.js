function strip(html) {
    var tempDiv = document.createElement("DIV");
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
    }
function myFunction() {
    document.getElementById("code").contentEditable = true;
  }
function myFunction2() {
    document.getElementById("line-no").contentEditable = true;
  }
function myFunction3() {
    document.getElementById("window-title").contentEditable = true;
  }
function takeshot(){
    html2canvas(document.getElementById('back')).then(function(canvas){
        return Canvas2Image.saveAsPNG(canvas)
})
}
$(document).ready(function(){
  $("#myModal").modal('show');
});