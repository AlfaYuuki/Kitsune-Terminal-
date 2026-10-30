export function updateHUD(state, root = document) {
  const scenario = state.currentScenario;
  const set = (id, value) => { const node = root.querySelector("#" + id); if (node) node.textContent = value; };
  set("metric-progress", (state.progress || 0) + "%");
  set("metric-stability", (scenario?.metrics?.stability ?? 98) + "%");
  set("metric-throughput", (scenario?.metrics?.throughput ?? 0) + " ops");
  set("metric-events", state.eventCount || 0);
  const fill = root.querySelector("#progress-fill");
  if (fill) fill.style.width = (state.progress || 0) + "%";
  const status = root.querySelector("#run-status");
  if (status && state.status !== "completed") { status.textContent = String(state.status).toUpperCase(); status.dataset.state = state.status; }
  const nodes = root.querySelector("#nodes");
  if (nodes && scenario) {
    nodes.replaceChildren();
    scenario.nodes.forEach(item => {
      const row = document.createElement("div"); row.className = "node-row";
      const name = document.createElement("span"); name.textContent = item.id + " · " + item.label;
      const stateLabel = document.createElement("b"); stateLabel.textContent = item.status.toUpperCase(); stateLabel.dataset.state = item.status;
      row.append(name, stateLabel); nodes.append(row);
    });
  }
}
