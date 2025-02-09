// 画布大小
var canvas_width = 1600; // 增加画布宽度，适应更长的线
var canvas_height = 5600;

var font_type = 'Arial';
var font_height = 14;
var font_color = '#E0E0E0'; // 文字颜色改为浅灰

// 行间距
var line_spacing = 40; // 适当增加行距，减少重叠

// 页边距
var right_margin = 50, left_margin = 50;
var top_margin = 60, bottom_margin = 20; // 增加顶部间距用于标题

// 记录最长国家名称的长度
var longest_name_length = 0;
var table;
var countries, affordability, availability, quality_safety, sustainability;

// 存储点信息 {x, y, value, type}
var points = [];

// 颜色美化
var colors = {
  "Affordability": "#FF6B6B",
  "Availability": "#4ECDC4",
  "Quality & Safety": "#5A9DF8",
  "Sustainability": "#F4D35E",
  "Line": "#B0B0B0"
};

function preload() {
  table = loadTable("data/Global-Food-Security-Index2022.csv", "csv", "header");
}

// 计算最长国家名称的宽度
function getLongestNameLength(names) {
  for (var i = 0; i < names.length; i++) {
    var current_name_length = textWidth(names[i]);
    if (current_name_length > longest_name_length) {
      longest_name_length = current_name_length;
    }
  }
  return longest_name_length;
}

// 将数据值映射到 0-100 线的位置（加长）
function mapToLine(value) {
  return map(value, 0, 100, 0, 600); // 0-100 线长度加长至 600px
}

function setup() {
  createCanvas(canvas_width, canvas_height);
  textFont(font_type);
  textSize(font_height);

  // 获取数据
  countries = table.getColumn("Country");
  affordability = table.getColumn("Affordability").map(Number);
  availability = table.getColumn("Availability").map(Number);
  quality_safety = table.getColumn("Quality and Safety").map(Number);
  sustainability = table.getColumn("Sustainability and Adaptation").map(Number);

  longest_name_length = getLongestNameLength(countries);
}

function draw() {
  background("#121212"); // 柔和黑色背景
  fill(font_color);
  noStroke();

  textSize(16);
  textAlign(LEFT);
  text("数据类型", left_margin, 30);

  var label_x = left_margin + 100;
  var label_y = 20;
  var label_size = 18;

  drawLegend(label_x, label_y, label_size);

  textSize(font_height); // 恢复文本大小
  var text_y = top_margin + font_height;
  var base_x = left_margin + longest_name_length + 20;
  var line_x_start = base_x + 20;
  var line_x_end = line_x_start + 600; // 线长度加倍

  points = []; // 清空上一帧的点数据

  for (var i = 0; i < countries.length; i++) {
    fill("#B0B0B0");
    text(countries[i], left_margin + longest_name_length - textWidth(countries[i]), text_y);

    stroke(colors.Line);
    strokeWeight(2); // 线稍微加粗
    line(line_x_start, text_y - font_height / 2, line_x_end, text_y - font_height / 2);

    var x_afford = line_x_start + mapToLine(affordability[i]);
    var x_avail = line_x_start + mapToLine(availability[i]);
    var x_quality = line_x_start + mapToLine(quality_safety[i]);
    var x_sustain = line_x_start + mapToLine(sustainability[i]);

    var point_y = text_y - font_height / 2;

    drawPoint(x_afford, point_y, colors["Affordability"], affordability[i]);
    drawPoint(x_avail, point_y, colors["Availability"], availability[i]);
    drawPoint(x_quality, point_y, colors["Quality & Safety"], quality_safety[i]);
    drawPoint(x_sustain, point_y, colors["Sustainability"], sustainability[i]);

    text_y += font_height + line_spacing;
  }

  checkMouseHover();
}

// 画顶部颜色图例，增加间距
function drawLegend(x, y, size) {
  var spacing = 140; // 每个数据类型之间的间隔

  Object.keys(colors).forEach((key, index) => {
    if (key !== "Line") {
      fill(colors[key]);
      rect(x + index * spacing, y, size, size, 5); // 圆角矩形
      fill("#E0E0E0");
      text(key, x + index * spacing + 25, y + 12);
    }
  });
}

// 画数据点（放大）
function drawPoint(x, y, color, value) {
  stroke(color);
  strokeWeight(10); // 默认放大点
  point(x, y);

  // 存储点数据
  points.push({ x: x, y: y, value: value, color: color });
}

// 处理鼠标悬停效果（放大悬停点）
function checkMouseHover() {
  for (var i = 0; i < points.length; i++) {
    var d = dist(mouseX, mouseY, points[i].x, points[i].y);
    if (d < 8) { // 增加检测范围
      fill(255);
      textSize(12);
      text(nf(points[i].value, 1, 1), points[i].x - 10, points[i].y - 15);

      // 悬停时放大点
      stroke(points[i].color);
      strokeWeight(15);
      point(points[i].x, points[i].y);
    }
  }
}
