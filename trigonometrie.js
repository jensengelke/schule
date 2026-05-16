// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Graph canvas setup (sin and cos)
const graphCanvas = document.getElementById('graphCanvas');
const graphCtx = graphCanvas.getContext('2d');

// Tangent canvas setup
const tanCanvas = document.getElementById('tanCanvas');
const tanCtx = tanCanvas.getContext('2d');

// Configuration
const centerX = canvas.width / 2;  // Center circle on canvas
const centerY = canvas.height / 2;  // Center circle vertically
const radius = 150;

// Graph configuration
const graphY = 20;  // Y position where graphs start
const graphWidth = 450;  // Width of each graph
const graphHeight = 400;  // Height of each graph (adjusted for sin/cos)
const graphSpacing = 60;  // Space between graphs (increased for labels)
const graphMargin = 25;  // Left margin for graphs

// Tangent graph configuration
const tanGraphHeight = 840;  // Full height for tangent (adjusted for labels)
let angle = 45;  // Start at 45 degrees (2 o'clock position)
const angleStep = 5;  // Degrees to rotate per click
const continuousStep = 1;  // Degrees per step during long press
const continuousInterval = 67;  // Milliseconds between steps (~15 steps/sec = 15°/sec)

// Long press handling
let isPressed = false;
let pressTimer = null;
let continuousTimer = null;

// Initialize
drawVisualization();

// Button event listeners
const clockwiseBtn = document.getElementById('clockwise');
const counterClockwiseBtn = document.getElementById('counterClockwise');

// Clockwise button
clockwiseBtn.addEventListener('mousedown', () => {
    handleButtonPress('clockwise');
});

clockwiseBtn.addEventListener('mouseup', () => {
    handleButtonRelease();
});

clockwiseBtn.addEventListener('mouseleave', () => {
    handleButtonRelease();
});

// Counter-clockwise button
counterClockwiseBtn.addEventListener('mousedown', () => {
    handleButtonPress('counterClockwise');
});

counterClockwiseBtn.addEventListener('mouseup', () => {
    handleButtonRelease();
});

counterClockwiseBtn.addEventListener('mouseleave', () => {
    handleButtonRelease();
});

// Touch support for mobile
clockwiseBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleButtonPress('clockwise');
});

clockwiseBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleButtonRelease();
});

counterClockwiseBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleButtonPress('counterClockwise');
});

counterClockwiseBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleButtonRelease();
});

function handleButtonPress(direction) {
    if (isPressed) return;
    isPressed = true;
    
    // Immediate single step
    if (direction === 'clockwise') {
        angle -= angleStep;
    } else {
        angle += angleStep;
    }
    drawVisualization();
    
    // Start timer for continuous rotation after 300ms
    pressTimer = setTimeout(() => {
        startContinuousRotation(direction);
    }, 300);
}

function handleButtonRelease() {
    isPressed = false;
    
    // Clear timers
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
    
    if (continuousTimer) {
        clearInterval(continuousTimer);
        continuousTimer = null;
    }
}

function startContinuousRotation(direction) {
    continuousTimer = setInterval(() => {
        if (direction === 'clockwise') {
            angle -= continuousStep;
        } else {
            angle += continuousStep;
        }
        drawVisualization();
    }, continuousInterval);
}

function drawVisualization() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the black circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw x-axis through center
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 20, centerY);
    ctx.lineTo(centerX + radius + 20, centerY);
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw y-axis through center
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX, centerY + radius + 20);
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw vertical axis at left of circle
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY - radius - 20);
    ctx.lineTo(centerX - radius, centerY + radius + 20);
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw vertical axis at right of circle
    ctx.beginPath();
    ctx.moveTo(centerX + radius, centerY - radius - 20);
    ctx.lineTo(centerX + radius, centerY + radius + 20);
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Convert angle to radians (note: canvas y-axis is inverted)
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate end point of radius line
    const endX = centerX + radius * Math.cos(angleRad);
    const endY = centerY - radius * Math.sin(angleRad);  // Subtract because canvas y is inverted
    
    // Draw blue radius line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Extend radius line as dotted line to tangent axis
    if (Math.abs(Math.cos(angleRad)) > 0.01) {  // Avoid division by zero
        // Determine which tangent axis to extend to (left or right)
        const extendToRight = Math.cos(angleRad) > 0;
        const tangentX = extendToRight ? centerX + radius : centerX - radius;
        
        // Calculate where the extended line intersects the tangent axis
        // Using similar triangles: the line continues in the same direction
        const slope = Math.tan(angleRad);
        const extendedY = centerY - (tangentX - centerX) * slope;
        
        // Draw dotted extension from circle edge to tangent axis
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(tangentX, extendedY);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw r=1 label at center of radius
    const labelX = centerX + (radius / 2) * Math.cos(angleRad);
    const labelY = centerY - (radius / 2) * Math.sin(angleRad);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'blue';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('r=1', labelX, labelY);
    
    // Draw angle arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, -angleRad, true);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw sine line (vertical projection)
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX, centerY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw cosine line (horizontal projection)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, centerY);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw tangent line (extends to right vertical axis)
    if (Math.abs(Math.cos(angleRad)) > 0.01) {  // Avoid division by zero
        const tanLength = Math.tan(angleRad);
        const tanEndY = centerY - radius * tanLength;
        
        ctx.beginPath();
        ctx.moveTo(centerX + radius, centerY);
        ctx.lineTo(centerX + radius, tanEndY);
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Add labels
    ctx.font = '14px Arial';
    ctx.fillStyle = 'black';
    
    // X-axis label
    ctx.textAlign = 'left';
    ctx.fillText('x', centerX + radius + 25, centerY);
    
    // Y-axis label
    ctx.textAlign = 'center';
    ctx.fillText('y', centerX, centerY - radius - 25);
    
    // Update angle display
    const normalizedAngle = ((angle % 360) + 360) % 360;
    document.getElementById('angleDisplay').textContent = `Angle: ${normalizedAngle.toFixed(0)}°`;
    
    // Calculate and display trigonometric values
    const sin = Math.sin(angleRad);
    const cos = Math.cos(angleRad);
    const tan = Math.tan(angleRad);
    
    // Display trig values on circle canvas
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const textX = 10;
    const textY = 10;
    const lineHeight = 20;
    
    ctx.fillText(`sin(${normalizedAngle.toFixed(0)}°) = ${sin.toFixed(4)}`, textX, textY);
    ctx.fillText(`cos(${normalizedAngle.toFixed(0)}°) = ${cos.toFixed(4)}`, textX, textY + lineHeight);
    ctx.fillText(`tan(${normalizedAngle.toFixed(0)}°) = ${tan.toFixed(4)}`, textX, textY + 2 * lineHeight);
    
    // Draw the three graphs on separate canvas
    drawGraphs(normalizedAngle);
}

function drawGraphs(currentAngle) {
    // Clear both graph canvases
    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    tanCtx.clearRect(0, 0, tanCanvas.width, tanCanvas.height);
    
    // Draw sine and cosine graphs on graphCanvas
    drawSinCosGraph('sin', graphY, 'red', currentAngle);
    drawSinCosGraph('cos', graphY + graphHeight + graphSpacing, 'green', currentAngle);
    
    // Draw tangent graph on tanCanvas
    drawTanGraph(currentAngle);
}

function drawSinCosGraph(funcName, startY, color, currentAngle) {
    const graphCenterY = startY + graphHeight / 2;
    
    // Draw graph background
    graphCtx.fillStyle = '#f9f9f9';
    graphCtx.fillRect(graphMargin, startY, graphWidth, graphHeight);
    
    // Draw border
    graphCtx.strokeStyle = '#ccc';
    graphCtx.lineWidth = 1;
    graphCtx.strokeRect(graphMargin, startY, graphWidth, graphHeight);
    
    // Draw center line (y=0) - highlighted
    graphCtx.beginPath();
    graphCtx.moveTo(graphMargin, graphCenterY);
    graphCtx.lineTo(graphMargin + graphWidth, graphCenterY);
    graphCtx.strokeStyle = '#333';
    graphCtx.lineWidth = 2;
    graphCtx.stroke();
    
    // Draw y-axis at x=0 (left edge for 0°)
    graphCtx.beginPath();
    graphCtx.moveTo(graphMargin, startY);
    graphCtx.lineTo(graphMargin, startY + graphHeight);
    graphCtx.strokeStyle = '#bbb';
    graphCtx.lineWidth = 1;
    graphCtx.stroke();
    
    // Draw the function curve
    graphCtx.beginPath();
    graphCtx.strokeStyle = color;
    graphCtx.lineWidth = 2;
    
    for (let deg = 0; deg <= 360; deg += 1) {
        const rad = (deg * Math.PI) / 180;
        const value = funcName === 'sin' ? Math.sin(rad) : Math.cos(rad);
        
        const x = graphMargin + (deg / 360) * graphWidth;
        const y = graphCenterY - (value * (graphHeight / 2) * 0.8);
        
        if (deg === 0) {
            graphCtx.moveTo(x, y);
        } else {
            graphCtx.lineTo(x, y);
        }
    }
    graphCtx.stroke();
    
    // Highlight current angle position
    const currentRad = (currentAngle * Math.PI) / 180;
    const currentValue = funcName === 'sin' ? Math.sin(currentRad) : Math.cos(currentRad);
    
    const currentX = graphMargin + (currentAngle / 360) * graphWidth;
    const currentY = graphCenterY - (currentValue * (graphHeight / 2) * 0.8);
    
    // Draw vertical line at current angle
    graphCtx.beginPath();
    graphCtx.moveTo(currentX, startY);
    graphCtx.lineTo(currentX, startY + graphHeight);
    graphCtx.strokeStyle = color;
    graphCtx.lineWidth = 1;
    graphCtx.setLineDash([3, 3]);
    graphCtx.stroke();
    graphCtx.setLineDash([]);
    
    // Draw highlight circle at current position
    graphCtx.beginPath();
    graphCtx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    graphCtx.fillStyle = color;
    graphCtx.fill();
    graphCtx.strokeStyle = 'white';
    graphCtx.lineWidth = 2;
    graphCtx.stroke();
    
    // Draw function label
    graphCtx.font = 'bold 16px Arial';
    graphCtx.fillStyle = color;
    graphCtx.textAlign = 'left';
    graphCtx.textBaseline = 'middle';
    graphCtx.fillText(funcName + '(θ)', graphMargin + 5, startY + 20);
    
    // Draw axis labels
    graphCtx.font = '11px Arial';
    graphCtx.fillStyle = '#666';
    graphCtx.textAlign = 'center';
    
    // 0°, 90°, 180°, 270°, 360° markers
    const markers = [0, 90, 180, 270, 360];
    markers.forEach(deg => {
        const x = graphMargin + (deg / 360) * graphWidth;
        graphCtx.fillText(deg + '°', x, startY + graphHeight + 15);
    });
}

function drawTanGraph(currentAngle) {
    const startY = 50;
    const graphCenterY = startY + tanGraphHeight / 2;
    const color = 'purple';
    
    // Draw graph background
    tanCtx.fillStyle = '#f9f9f9';
    tanCtx.fillRect(graphMargin, startY, graphWidth, tanGraphHeight);
    
    // Draw border
    tanCtx.strokeStyle = '#ccc';
    tanCtx.lineWidth = 1;
    tanCtx.strokeRect(graphMargin, startY, graphWidth, tanGraphHeight);
    
    // Draw center line (y=0) - highlighted
    tanCtx.beginPath();
    tanCtx.moveTo(graphMargin, graphCenterY);
    tanCtx.lineTo(graphMargin + graphWidth, graphCenterY);
    tanCtx.strokeStyle = '#333';
    tanCtx.lineWidth = 2;
    tanCtx.stroke();
    
    // Draw y-axis at x=0
    tanCtx.beginPath();
    tanCtx.moveTo(graphMargin, startY);
    tanCtx.lineTo(graphMargin, startY + tanGraphHeight);
    tanCtx.strokeStyle = '#bbb';
    tanCtx.lineWidth = 1;
    tanCtx.stroke();
    
    // Draw the tangent curve with discontinuity handling
    tanCtx.strokeStyle = color;
    tanCtx.lineWidth = 2;
    
    const maxTanValue = 5;  // Clip range for visibility
    let prevValue = null;
    
    for (let deg = 0; deg <= 360; deg += 0.5) {
        const rad = (deg * Math.PI) / 180;
        let value = Math.tan(rad);
        
        // Clip extreme values
        if (value > maxTanValue) value = maxTanValue;
        if (value < -maxTanValue) value = -maxTanValue;
        
        const x = graphMargin + (deg / 360) * graphWidth;
        const y = graphCenterY - (value * (tanGraphHeight / 2) * 0.15);
        
        // Check for discontinuity (when tangent jumps from +inf to -inf or vice versa)
        if (prevValue !== null && Math.abs(value - prevValue) > maxTanValue * 0.8) {
            // Don't connect across discontinuity - start new path
            tanCtx.stroke();
            tanCtx.beginPath();
            tanCtx.moveTo(x, y);
        } else {
            if (deg === 0) {
                tanCtx.beginPath();
                tanCtx.moveTo(x, y);
            } else {
                tanCtx.lineTo(x, y);
            }
        }
        
        prevValue = value;
    }
    tanCtx.stroke();
    
    // Highlight current angle position
    const currentRad = (currentAngle * Math.PI) / 180;
    let currentValue = Math.tan(currentRad);
    if (currentValue > maxTanValue) currentValue = maxTanValue;
    if (currentValue < -maxTanValue) currentValue = -maxTanValue;
    
    const currentX = graphMargin + (currentAngle / 360) * graphWidth;
    const currentY = graphCenterY - (currentValue * (tanGraphHeight / 2) * 0.15);
    
    // Draw highlight circle at current position
    tanCtx.beginPath();
    tanCtx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    tanCtx.fillStyle = color;
    tanCtx.fill();
    tanCtx.strokeStyle = 'white';
    tanCtx.lineWidth = 2;
    tanCtx.stroke();
    
    // Draw function label
    tanCtx.font = 'bold 16px Arial';
    tanCtx.fillStyle = color;
    tanCtx.textAlign = 'left';
    tanCtx.textBaseline = 'middle';
    tanCtx.fillText('tan(θ)', graphMargin + 5, startY + 20);
    
    // Draw axis labels
    tanCtx.font = '11px Arial';
    tanCtx.fillStyle = '#666';
    tanCtx.textAlign = 'center';
    
    // 0°, 90°, 180°, 270°, 360° markers
    const markers = [0, 90, 180, 270, 360];
    markers.forEach(deg => {
        const x = graphMargin + (deg / 360) * graphWidth;
        tanCtx.fillText(deg + '°', x, startY + tanGraphHeight + 15);
    });
}

// Made with Bob
