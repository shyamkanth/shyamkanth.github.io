function copyToClipboard(id) {
    const element = document.getElementById(id);
    const content = element?.textContent;
    if (!content) return;

    navigator.clipboard.writeText(content)
        .then(() => {
            const tooltip = document.createElement("div");
            tooltip.innerText = "Copied to clipboard";
            tooltip.style.position = "absolute";
            tooltip.style.backgroundColor = "black";
            tooltip.style.color = "white";
            tooltip.style.padding = "5px";
            tooltip.style.borderRadius = "5px";
            tooltip.style.fontSize = "12px";
            tooltip.style.top = `${element.getBoundingClientRect().top - 30}px`;
            tooltip.style.right = `${element.getBoundingClientRect().right}px`;
            tooltip.style.zIndex = "1000";

            document.body.appendChild(tooltip);

            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 1000);
        })
        .catch(err => console.error("Failed to copy text to clipboard:", err));
}


