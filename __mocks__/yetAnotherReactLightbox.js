/* eslint-disable react/prop-types */
const React = require("react");

const Lightbox = (props) => {
  const { children, slides, render } = props;
  if (render?.slide) {
    const SlideComponent = render.slide;
    return React.createElement(
      "div",
      { "data-testid": "lightbox" },
      slides?.map?.((slide) =>
        React.createElement(SlideComponent, { key: slide.src, slide }),
      ),
      children,
    );
  }
  return React.createElement("div", { "data-testid": "lightbox" }, children);
};

module.exports = Lightbox;
module.exports.default = Lightbox;
