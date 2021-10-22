const html = `<div class="container">
<div class="mb-3">
  <table>
    <tbody data-testid="consoleOutput" id="console"></tbody>
  </table>
</div>
</div>
<template id="logEntry">
  <tr>
    <td>\${level.upperCase}</td>
    <td>\${message}</td>
  </tr></template>
`;

export default html;
