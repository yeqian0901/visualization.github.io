// 从 CSS 变量中读取绿色渐变色
const rootStyles = getComputedStyle(document.documentElement);
const mapGreenLight = rootStyles.getPropertyValue('--map-green-light').trim() || "#AED581";
const mapGreenDark = rootStyles.getPropertyValue('--map-green-dark').trim() || "#4CAF50";

// ---------- D3 地图代码 ----------
const width = 800, height = 600;
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "var(--container-bg)");

const projection = d3.geoMercator().scale(130).translate([width / 2, height / 1.5]);
const path = d3.geoPath().projection(projection);

// 使用 d3.interpolateRgb 创建绿色渐变色比例尺
const colorScale = d3.scaleSequential(d3.interpolateRgb(mapGreenLight, mapGreenDark)).domain([30, 85]);

const tooltip = d3.select("#tooltip");

Promise.all([
    d3.json("data/countries.geojson"),
    d3.csv("data/Global-Food-Security-Index2022.csv")
]).then(([geoData, csvData]) => {
    const countryData = {};
    csvData.forEach(d => {
        countryData[d.Country] = {
            rank: +d.Rank,
            overall: +d["Overall score"],
            affordability: +d.Affordability,
            availability: +d.Availability,
            quality: +d["Quality and Safety"],
            sustainability: +d["Sustainability and Adaptation"]
        };
    });

    svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            const country = d.properties.name;
            return countryData[country] ? colorScale(countryData[country].overall) : "#ccc";
        })
        .attr("stroke", "var(--text-color)")
        .on("mouseover", function(event, d) {
            const country = d.properties.name;
            d3.select(this).attr("fill-opacity", 0.8);
            if (countryData[country]) {
                tooltip.style("display", "block")
                    .html(`<strong>${country}</strong><br>Overall Score: ${countryData[country].overall}`);
            }
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill-opacity", 1.0);
            tooltip.style("display", "none");
        })
        .on("click", function(event, d) {
            const country = d.properties.name;
            if (countryData[country]) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "var(--primary-color)")
                    .attr("stroke-width", 4)
                    .transition()
                    .duration(200)
                    .attr("stroke", "var(--text-color)")
                    .attr("stroke-width", 1);
                updateInfo(country, countryData[country]);
                updateRadarChart(country, countryData[country]);
            } else {
                alert(`No data available for ${country}`);
            }
        });
});

function updateInfo(country, data) {
    document.getElementById("country-name").textContent = country;
    document.getElementById("rank").textContent = data.rank;
    document.getElementById("overall").textContent = data.overall;
    document.getElementById("affordability").textContent = data.affordability;
    document.getElementById("availability").textContent = data.availability;
    document.getElementById("quality").textContent = data.quality;
    document.getElementById("sustainability").textContent = data.sustainability;
}

// ---------- Chart.js 雷达图代码 ----------
let radarChart;
function initRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Affordability', 'Availability', 'Quality & Safety', 'Sustainability'],
            datasets: [{
                label: 'Indicator Scores',
                data: [0, 0, 0, 0],
                backgroundColor: 'rgba(76, 175, 80, 0.2)', // 主绿色半透明
                borderColor: 'rgba(76, 175, 80, 1)',
                pointBackgroundColor: 'rgba(76, 175, 80, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        color: "#1B5E20"
                    },
                    grid: {
                        color: "#A5D6A7"
                    },
                    angleLines: {
                        color: "#A5D6A7"
                    },
                    pointLabels: {
                        color: "#1B5E20"
                    }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#1B5E20" }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateRadarChart(country, data) {
    if (!radarChart) return;
    radarChart.data.datasets[0].data = [
        data.affordability,
        data.availability,
        data.quality,
        data.sustainability
    ];
    radarChart.data.datasets[0].label = country;
    radarChart.update();
}

initRadarChart();
