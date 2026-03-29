//https://www.06se.com

// 选择指定的父元素
const parentElement = document.querySelector("body > main > div > div > article > div.article-content");

if (parentElement) {
  // 获取父元素下所有的 img 元素
  const imgElements = parentElement.querySelectorAll("img");

  // 提取所需属性
  const results = Array.from(imgElements).map((img, index) => ({
    index: index + 1,
    tagName: img.tagName.toLowerCase(),
    alt: img.getAttribute("alt"),
    src: img.getAttribute("data-src"),
    imgboxIndex: img.getAttribute("imgbox-index")
  }));

  // 输出 JSON 格式结果到控制台
  //console.log("提取结果 JSON:");
  console.log(JSON.stringify(results, null, 2));
  // 返回结果以便在应用中使用
  return {
    status: 200,
    data: results,
  };
} else {
  console.log("未找到指定的父元素");
  // 未找到指定的父元素
  return {
    status: 404,
    data: []
  };
}