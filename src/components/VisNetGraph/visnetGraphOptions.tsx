const visnet_options = {
  groups: {
    group1: {
      color: {
        background: "rgba(255, 255, 255, 0.3)", // 반투명 배경
        border: "rgba(255, 255, 255, 0.6)", // 반투명 경계선
        highlight: {
          background: "rgba(255, 255, 255, 0.4)", // 강조 시 반투명 배경
          border: "rgba(255, 255, 255, 0.8)", // 강조 시 반투명 경계선
        },
        hover: {
          background: "rgba(255, 255, 255, 0.5)", // 호버 시 반투명 배경
          border: "rgba(255, 255, 255, 0.9)", // 호버 시 반투명 경계선
        },
      },
    },
    group2: {
      color: {
        background: "rgba(173, 216, 230, 0.3)", // Light Blue 반투명 배경
        border: "rgba(173, 216, 230, 0.6)", // 반투명 경계선
        highlight: {
          background: "rgba(173, 216, 230, 0.4)", // 강조 시 반투명 배경
          border: "rgba(173, 216, 230, 0.8)", // 강조 시 경계선
        },
        hover: {
          background: "rgba(173, 216, 230, 0.5)", // 호버 시 반투명 배경
          border: "rgba(173, 216, 230, 0.9)", // 호버 시 경계선
        },
      },
    },
    group3: {
      color: {
        background: "rgba(144, 238, 144, 0.3)", // Light Green 반투명 배경
        border: "rgba(144, 238, 144, 0.6)", // 반투명 경계선
        highlight: {
          background: "rgba(144, 238, 144, 0.4)", // 강조 시 배경
          border: "rgba(144, 238, 144, 0.8)", // 강조 시 경계선
        },
        hover: {
          background: "rgba(144, 238, 144, 0.5)", // 호버 시 배경
          border: "rgba(144, 238, 144, 0.9)", // 호버 시 경계선
        },
      },
    },
    group4: {
      color: {
        background: "rgba(238, 130, 238, 0.3)", // Violet 반투명 배경
        border: "rgba(238, 130, 238, 0.6)", // 반투명 경계선
        highlight: {
          background: "rgba(238, 130, 238, 0.4)", // 강조 시 배경
          border: "rgba(238, 130, 238, 0.8)", // 강조 시 경계선
        },
        hover: {
          background: "rgba(238, 130, 238, 0.5)", // 호버 시 배경
          border: "rgba(238, 130, 238, 0.9)", // 호버 시 경계선
        },
      },
    },
  },
  edges: {
    color: {
      color: "rgba(255, 255, 255, 0.4)", // Glassmorphism 효과의 반투명 색상
      highlight: "rgba(255, 255, 255, 0.7)", // 강조된 상태에서 조금 더 투명하게
      hover: "rgba(255, 255, 255, 0.6)", // 마우스 오버 시 색상
    },
    width: 3, // 엣지의 두께
    shadow: true, // 엣지에 그림자 효과 추가
    smooth: {
      enabled: true, // 부드러운 선으로 설정
      type: "dynamic",
      roundness: 0.5,
    },
  },
  nodes: {
    shape: "dot",
    size: 16,
    borderWidth: 2,
    color: {
      border: "rgba(255, 255, 255, 0.4)", // 노드의 경계선 색상 반투명
      background: "rgba(255, 255, 255, 0.1)", // 노드 배경의 반투명 효과
      highlight: {
        border: "rgba(255, 255, 255, 0.8)",
        background: "rgba(255, 255, 255, 0.2)",
      },
      hover: {
        border: "rgba(255, 255, 255, 0.6)",
        background: "rgba(255, 255, 255, 0.2)",
      },
    },
  },
  physics: {
    enabled: true,
  },
  interaction: {
    hover: true,
  },
};

export default visnet_options;
