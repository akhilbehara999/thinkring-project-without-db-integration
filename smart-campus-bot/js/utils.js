// Basic string hashing function (for demonstration purposes)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}

function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

function validateField(field) {
    if (field.value.trim() === '') {
        field.classList.add('not-valid');
        return false;
    } else {
        field.classList.remove('not-valid');
        return true;
    }
}

/**
 * Draws a simple bar chart on a canvas element.
 * @param {string} canvasId The ID of the canvas element.
 * @param {object} chartData The data for the chart. Should have a `labels` array and a `values` array.
 * @param {object} options Optional configuration for colors.
 */
function drawBarChart(canvasId, chartData, options) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { labels, values } = chartData;
    const { barColor = '#00d4ff', labelColor = '#e6f3ff', axisColor = 'rgba(230, 243, 255, 0.5)' } = options || {};

    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = (chartWidth / values.length) * 0.6;
    const barSpacing = (chartWidth / values.length) * 0.4;
    const maxValue = Math.max(...values, 1);

    let animationFraction = 0;
    const animationDuration = 1000; // 1 second
    let startTime = null;

    function drawChartFrame(fraction) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding - 10);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding + 10, canvas.height - padding);
        ctx.stroke();

        // Draw Bars and Labels
        values.forEach((value, i) => {
            const animatedValue = value * fraction;
            const barHeight = (animatedValue / maxValue) * chartHeight;
            const x = padding + i * (barWidth + barSpacing) + barSpacing / 2;
            const y = canvas.height - padding - barHeight;

            // Bar
            ctx.fillStyle = barColor;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Label
            ctx.fillStyle = labelColor;
            ctx.textAlign = 'center';
            ctx.font = '12px "Segoe UI"';
            ctx.fillText(labels[i], x + barWidth / 2, canvas.height - padding + 20);

            // Value on top
            ctx.font = '14px "Segoe UI"';
            ctx.fillText(Math.round(animatedValue), x + barWidth / 2, y - 8);
        });
    }

    function animationLoop(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        animationFraction = elapsedTime / animationDuration;
        if (animationFraction > 1) animationFraction = 1;

        drawChartFrame(animationFraction);

        if (animationFraction < 1) {
            requestAnimationFrame(animationLoop);
        }
    }

    requestAnimationFrame(animationLoop);
}
