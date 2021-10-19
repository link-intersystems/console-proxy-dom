const html = `<div class="container">
  <div class="mb-3">
    <label for="console" class="form-label">Console textarea</label>
    <textarea data-testid="consoleOutput" class="form-control" id="console" rows="5" readonly></textarea>
  </div>
  <div class="mb-3">
    <label for="console" class="form-label">Console div</label>
    <div class="form-control" id="consoleDiv" style="height:8em; overflow: scroll;"></div>
  </div>
</div>`;

export default html;
