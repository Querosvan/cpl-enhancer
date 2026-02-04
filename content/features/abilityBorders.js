(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const ABILITIES = [
    { name: "Loyal", type: "positive" },
    { name: "Long lived", type: "positive", variants: ["Long-lived", "Longlived"] },
    { name: "Leader", type: "positive" },
    { name: "Fast learner", type: "positive", variants: ["Fast-learner", "Fastlearner"] },
    { name: "Cheap", type: "positive" },
    { name: "Entertaining", type: "positive" },
    { name: "Prodigy", type: "positive" },
    { name: "Small Heart", type: "positive", variants: ["Tiny Heart"] },
    { name: "Medium Heart", type: "positive" },
    { name: "Big Heart", type: "positive" },
    { name: "Golden Heart", type: "positive" },
    { name: "Platinum Heart", type: "positive" },
    { name: "Famous", type: "positive" },
    { name: "Slow learner", type: "negative", variants: ["Slow-learner", "Slowlearner"] },
    { name: "Greedy", type: "negative" },
    { name: "Toxic", type: "negative" },
    { name: "Short Lived", type: "negative", variants: ["Short-lived", "Shortlived"] },
    { name: "Antisocial", type: "negative" },
    { name: "Choker", type: "negative" },
    { name: "Fragger", type: "mixed" },
    { name: "Tryhard", type: "mixed", variants: ["Try hard", "Try-hard"] }
  ];

  const ABILITY_ATTRS = [
    "title",
    "alt",
    "aria-label",
    "data-tooltip",
    "data-title",
    "data-original-title",
    "data-bs-original-title",
    "data-bs-title",
    "data-tooltip-title",
    "data-tooltip-text",
    "data-tooltip-content",
    "data-tippy-content",
    "data-content",
    "data-ability"
  ];

  const ABILITY_ATTR_SELECTOR = ABILITY_ATTRS.map((attr) => `[${attr}]`).join(",");

  function normalizeSignature(sig) {
    if (!sig) return "";
    return sig
      .split("|")
      .map((part) => part.trim())
      .join("|");
  }

  const SVG_SIGNATURE_ABILITY = new Map(
    [
      [
        "M67.5997 115.643L74.9241 113.815L81.8578|M67.6191 118.021L76.1936 116.724L84.1625|M3.94569 119.828L3.90663 119.691C1.4847 |M111.497 72.2979L111.295 72.2243C110.704|M148.766 13.459C132.294 -6.86075 115.822|M144.614 16.2098C130.03 -1.77445 115.454|M91.3553 21.2179C89.4233 23.4798 86.5759|M83.9737 28.9755C84.9133 28.9755 85.675",
        "Loyal"
      ],
      [
        "M22.2339 17.643C43.9358 2.5366 72.2561 4|M92.6436 36.0527L92.6744 36.0991C92.6744|M14.3011 47.1828C21.7802 39.9036 36.9887|M5.47653 42.4075C10.5617 33.3437 19.2456|M115.19 53.7422V136.616C115.19 136.616 1|M109.104 86.9752C106.819 90.4035 104.676|M81.0178 129.509C81.0178 129.509 78.5457|M37.3174 86.9771C39.6018 90.4054 41.7454|M90.7196 146.29C90.6726 146.635 90.61 14|M69.6282 148.592C66.3581 148.921 63.088 |M90.7204 146.291C90.6734 146.635 90.6109|M115.19 66.3125C115.19 66.3125 128.756 6|M138.723 116.859V81.559C143.292 81.559 1|M31.8098 66.3125C31.8098 66.3125 18.2442|M8.29271 81.5449V116.845C3.70825 116.845|M31.4336 116.248C31.4336 116.248 39.7263|M126.378 127.801L121.355 129.977C121.355|M65.5435 105.024C65.5435 113.774 60.5522|M60.8185 105.024C60.8185 109.956 57.9552|M59.4256 105.134C59.4256 109.001 57.2507|M60.8187 98.6375C60.8187 99.4672 59.3323|M103.487 105.024C103.487 113.774 98.4956|M98.7619 105.024C98.7619 109.956 95.8985|M97.369 105.134C97.369 109.001 95.1941 1|M98.7621 98.6375C98.7621 99.4672 97.2757|M56.2962 96.6036C52.4002 95.9931 48.5042|M104.973 95.6953C101.03 95.4605 97.134 9|M114.471 113.117C118.258 101.971 117.162",
        "Long Lived"
      ],
      [
        "M21.3164 63.2353C21.3164 61.6016 32.0085|M86.3662 68.6747C86.3662 67.041 97.0583 |M102.817 37.2405C102.817 40.2386 100.377|M124.093 127.667C99.9107 134.22 63.0086 |M70.579 8.62311C70.579 12.447 67.4754 15|M18.3026 32.3204C18.3026 36.1443 15.199 |M37.767 31.801C37.767 34.7991 35.3272 37|M121.331 32.3204C121.331 36.1443 118.227|M124.093 127.668C99.9107 134.221 63.0086",
        "Leader"
      ],
      [
        "M179.918 76.7221C179.918 76.6161 179.918|M78.4885 43.6553C78.4885 43.6553 75.4696|M81.3492 71.4388C81.3492 71.4388 76.3119|M97.3915 61.0645L96.0225 64.4579C96.0225|M55.3735 79.2504L56.4968 78.6142C56.4968|M57.234 51.078L59.4279 51.5728C59.4279 5|M71.5205 95.3516C71.5205 95.3516 74.7675|M94.6884 100.334C93.337 106.75 99.8485 1|M57.5676 72.5332C56.2161 77.0754 59.0419|M99.2167 56.2926C99.3044 56.2219 99.3922|M188.746 55.9739C190.01 57.6175 191.168 |M193.081 69.9531L193.959 74.7781C193.959|M183.516 53.4632C183.516 53.4632 178.32 |M99.0586 10.4631L105.588 11.2937C105.588|M151.608 105.529C151.608 105.529 150.467|M175.811 99.5391C175.811 99.5391 173.951|M85.4048 92.6638C85.4048 92.6638 82.8774|M198.751 82.0586C198.751 82.0586 199.172|M189.817 53.3384L192.327 49.627C192.327 |M178.356 79.3906C178.356 79.3906 178.584|M152.258 66.9303L155.75 61.0449C155.75 6|M111.89 86.9375C112.048 95.2442 115.716 |M87.2649 44.9785C87.2649 44.9785 89.5817|M61.2884 43.6543C59.9369 49.0271 59.9369|M115.593 72.5331L122.771 71.5257C122.771|M89.4236 34.5527C88.511 40.3321 90.231 4|M120.876 41.5684C120.876 41.5684 118.068|M151.45 59.8786C151.45 59.8786 151.047 6|M107.958 14.3859L108.239 12.7246C108.239|M168.896 34.4277C167.317 36.9197 165.86 |M205.245 51.0945C203.279 42.9823 197.821|M122.175 103.002C116.277 101.199 111.24 |M153.065 53.5685C154.539 58.4111 152.275|M24.3438 13.1855H58.3407|M5.26562 32.5898H39.2626|M12.2686 51.9785H46.2655",
        "Fast Learner"
      ],
      [
        "M25.1078 19.9917C49.6147 2.87381 81.5956|M104.618 40.8535L104.654 40.9073C104.654|M16.1493 53.4651C24.5951 45.2165 41.7693|M6.18432 48.055C11.9267 37.7842 21.733 4|M130.079 60.8966V154.806C130.079 154.806|M64.8978 111.576C56.9821 111.328 53.2363|M120.449 98.5566C117.87 102.441 115.449 |M91.4902 146.753C91.4902 146.753 88.6985|M59.3145 158.354C59.3145 158.354 64.5975|M101.102 113.049C109.018 112.801 112.764|M46.3633 98.5566C48.943 102.441 51.3637 |M130.079 75.1406C130.079 75.1406 145.398|M156.653 132.42V92.4189C161.812 92.4189 |M35.9207 75.1406C35.9207 75.1406 20.6017|M9.36456 92.4004V132.401C4.18755 132.401|M144.726 144.34L139.054 146.806C139.054",
        "Cheap"
      ],
      [
        "M4.02832 49.982C4.02832 49.1709 4.57318 |M112.256 12.2257C112.504 12.9374 112.108|M112.256 12.2257C112.504 12.9374 112.108|M5.56875 29.2209L0.09375 34.3535L14.2917|M23.5385 23.1838L18.0635 28.3164L32.2614|M41.4985 17.132L36.0244 22.2656L50.225 3|M59.434 11.0646L53.959 16.1973L68.1569 3|M77.2759 5.06952L71.8018 10.2031L86.0024|M95.3617 -0.997877L89.8867 4.13477L104.0|M117.887 61.6502C117.887 62.4116 117.589|M19.1738 44.968L12.3545 48.0879L20.9846 |M38.1035 44.9661L31.2842 48.0859L39.9143|M57.0635 44.9544L50.2441 48.0742L58.8743|M75.9932 44.968L69.1738 48.0879L77.804 6|M94.8018 44.97L87.9824 48.0898L96.6126 6|M113.899 44.9544L107.08 48.0742L115.71 6|M117.887 62.3945H4.02832V64.1987H117.887|M11.2598 92.2871H110.06|M11.2598 101.953H110.06|M11.2598 112.828H110.06|M39.873 67.8398V91.9894|M80.8359 67.8398V91.9894|M110.358 67.543H10.9629V122.496H110.358V",
        "Entertaining"
      ],
      [
        "M127.13 33.3607H1.87012L30.8152 1.84766H|M90.5001 33.3607H38.5L50.523 1.84766H78.|M1.87012 33.3594L64.5096 130.152L127.13 |M38.5 33.3594L64.5094 130.152L90.5001 33",
        "Prodigy"
      ],
      [
        "M24.0488 19.0825C47.5222 2.74265 78.1545|M100.207 38.9961L100.24 39.0469C100.24 3|M15.4685 51.035C23.5581 43.1614 40.0081 |M5.92332 45.8705C11.4236 36.0666 20.8163|M124.594 58.1302V147.771C124.594 147.771|M118.01 94.0785C115.54 97.7867 113.221 9|M87.632 140.083C87.632 140.083 84.958 13|M58.4385 148.787C58.4385 148.787 60.5709|M40.3634 94.0785C42.8343 97.7867 45.1528|M124.594 71.7266C124.594 71.7266 139.267|M150.047 126.401V88.2184C154.989 88.2184|M34.4063 71.7266C34.4063 71.7266 19.7333|M8.96967 88.2012V126.384C4.01096 126.384|M138.624 137.779L133.191 140.133C133.191|M70.3019 111.466C70.3019 120.932 64.9032|M111.342 111.466C111.342 120.932 105.944|M106.671 113.989C106.671 114.751 106.57 |M65.428 114.768C65.428 115.53 65.3264 11",
        "Greedy"
      ],
      [
        "M152.925 115.395L91.0043 7.82249C88.2279|M77.5 9.7998C79.4709 9.7998 81.4247 10.7|M77.4825 92.0304C81.6851 92.0304 85.092 |M77.4824 93.5605C75.7686 93.5605 74.1576|M85.3834 79.8585C84.5265 78.3628 83.3096|M69.6156 79.8585C70.4725 78.3628 71.6893|M77.4997 54.6035C60.1556 54.6035 46.085",
        "Toxic"
      ],
      [
        "M19.3576 9.97783C38.2578 -1.23696 62.909|M80.665 17.1133L80.6975 17.1457C80.6975 |M12.4472 26.8148C18.9608 20.4588 32.2017|M100.298 32.5293V104.768C100.298 104.768|M93.0672 57.449C92.335 60.9632 90.1994 6|M70.5514 98.5798C70.5514 98.5798 68.4005|M35.0544 58.1674C36.6104 61.4065 38.6087|M100.298 43.4844C100.298 43.4844 112.105|M120.769 87.5332V56.7613C124.75 56.7613 |M27.6873 43.4844C27.6873 43.4844 15.8803|M7.21535 56.7773V87.5493C3.23394 87.534 |M111.587 96.7168L107.209 98.6114C107.209|M57.1739 78.1075C57.1739 85.7317 52.8264|M53.0549 78.1071C53.0549 82.4005 50.5532|M51.8496 78.1982C51.8496 81.5596 49.9581|M53.0552 72.5452C53.0552 73.2633 51.7586|M90.2149 78.1075C90.2149 85.7317 85.8674|M86.0959 78.1071C86.0959 82.4005 83.5942|M84.8906 78.1982C84.8906 81.5596 82.9991|M86.0963 72.5452C86.0963 73.2633 84.7996",
        "Short Lived"
      ],
      [
        "M23.4438 18.679C46.3267 2.685 76.1884 4.|M97.6855 38.1699L97.7185 38.2196C97.7185|M15.0794 49.9539C22.9655 42.2469 39.0017|M5.77439 44.8996C11.1363 35.3032 20.2927|M121.46 56.8994V144.643C121.46 144.643 1|M85.4273 137.119C85.4273 137.119 82.8206|M97.7189 155.199C97.7189 155.199 100.293|M121.459 70.209C121.459 70.209 135.763 7|M146.273 123.728V86.353C151.09 86.353 15|M33.5408 70.209C33.5408 70.209 19.237 73|M8.74401 86.3359V123.711C3.91006 123.711|M135.137 134.863L129.841 137.167C129.841|M41.7903 85.3563C40.9819 89.649 43.5226 |M112.435 88.2241C112.748 92.5831 110.026|M103.972 120.758C98.8408 122.847 93.5779|M96.9104 117.592C98.3501 117.592 99.5171|M102.289 113.267C102.289 117.742 99.6984|M101.035 113.365C101.035 116.879 99.0548|M102.289 107.483C102.289 108.229 100.952|M49.9237 120.262C55.0547 122.35 60.3176 |M56.9846 117.096C58.4243 117.096 59.5913|M63.188 112.771C63.188 117.246 60.5978 1|M61.934 112.869C61.934 116.383 59.9542 1|M63.1879 106.987C63.1879 107.733 61.8516",
        "Antisocial"
      ],
      [
        "M23.7466 18.8817C46.9247 2.7148 77.1717 |M98.9463 38.584L98.9795 38.634C98.9795 3|M15.2742 50.4954C23.262 42.7052 39.5051 |M5.8491 45.385C11.2802 35.6849 20.5548 3|M123.027 57.5148V146.207C123.027 146.207|M97.2082 109.416C105.631 107.942 110.794|M113.067 83.5989C114.002 87.9045 111.429|M86.5299 138.601C86.5299 138.601 83.8895|M99.4805 160.598C99.4805 160.598 94.4839|M59.174 107.826C50.7516 106.351 45.5879 |M43.1147 83.3815C42.1789 87.6871 44.7524|M123.026 70.9668C123.026 70.9668 137.515|M148.16 125.063V87.2847C153.039 87.2847 |M33.9731 70.9668C33.9731 70.9668 19.4847|M8.85684 87.2676V125.046C3.96051 125.046|M136.879 136.322L131.515 138.651C131.515",
        "Choker"
      ],
      [
        "M46.0397 61.7578H44.6171V65.7817H39.6379|M105.186 61.7578H103.746V65.7817H98.7845|M70.8476 58.391C70.1007 58.2138 69.3004 |M66.3481 47.8082H70.6515V45.5392H74.6705|M70.6515 88.0117H66.3481V90.2984H62.3291|M137 64.8607H127.966C126.437 34.4955 102",
        "Fragger"
      ],
      [
        "M23.8979 18.9821C47.2237 2.72872 77.6633|M99.5762 38.7891L99.6096 38.8393C99.6096|M15.3711 50.7652C23.4098 42.9333 39.7564|M5.88645 45.6277C11.3521 35.8757 20.6858|M123.81 57.8215V146.988C123.81 146.988 1|M113.585 84.6357C113.417 89.0654 110.743|M87.0807 139.34C87.0807 139.34 84.4235 1|M44.3476 86.9256C44.7176 91.3384 47.3916|M64.7129 155.729C64.7129 155.729 79.3945|M123.811 71.3477C123.811 71.3477 138.391|M149.104 125.733V87.7525C154.015 87.7525|M34.1897 71.3477C34.1897 71.3477 19.609 |M8.91325 87.7363V125.717C3.98574 125.717|M137.751 137.051L132.353 139.392C132.353|M70.4478 112.999C70.4478 122.414 65.0831|M65.3694 112.999C65.3694 118.304 62.2918|M63.873 113.117C63.873 117.278 61.5354 1|M65.3699 106.126C65.3699 107.019 63.7722|M111.23 112.999C111.23 122.414 105.865 1|M106.152 112.999C106.152 118.304 103.074|M104.655 113.117C104.655 117.278 102.318|M106.152 106.126C106.152 107.019 104.554|M124.365 119.652C128.434 107.66 127.257",
        "Tryhard"
      ],
      [
        "M72.6622 120.775L72.325 120.652C71.3375 |M134.921 22.4856C107.404 -11.459 79.8873|M127.984 27.0771C103.623 -2.96593 79.273|M39.0159 35.4457C35.7886 39.2242 31.0319|M26.6848 48.4069C28.2543 48.4069 29.5267",
        "Big Heart"
      ],
      [
        "M72.6602 120.846L72.323 120.723C71.3356 |M134.917 22.5008C107.402 -11.4638 79.886|M127.98 27.0932C103.62 -2.96759 79.2713",
        "Golden Heart"
      ],
      [
        "M72.6622 120.775L72.325 120.652C71.3375 |M134.921 22.4856C107.404 -11.459 79.8873|M127.984 27.0771C103.623 -2.96593 79.273|M39.0164 35.4457C35.7891 39.2242 31.0324|M26.6848 48.4069C28.2543 48.4069 29.5267",
        "Platinum Heart"
      ],
      [
        "M24.5024 19.3855C48.4187 2.78637 79.629 |M102.097 39.6152L102.13 39.666C102.13 39|M15.7597 51.8444C24.002 43.8458 40.7624 |M6.0349 46.5986C11.6389 36.6391 21.2089 |M126.945 59.0524V150.116C126.945 150.116|M120.238 95.5712C117.72 99.3382 115.358 |M89.2859 142.306C89.2859 142.306 86.5615|M41.1252 95.5712C43.6427 99.3382 46.005 |M99.9769 160.746C99.9251 161.125 99.8562|M76.733 163.274C73.1292 163.635 69.5253 |M99.9769 160.746C99.9251 161.125 99.8562|M126.944 72.8652C126.944 72.8652 141.894|M152.878 128.409V89.6198C157.913 89.6198|M35.0552 72.8652C35.0552 72.8652 20.1054|M9.1389 89.6016V128.39C4.08664 128.39 0 |M141.239 139.967L135.704 142.358C135.704|M72.2314 115.404C72.2314 125.02 66.7308 |M67.0242 115.404C67.0242 120.823 63.8687|M65.4893 115.525C65.4893 119.774 63.0925|M67.024 108.386C67.024 109.298 65.3859 1|M114.046 115.404C114.046 125.02 108.545 |M108.839 115.404C108.839 120.823 105.683|M107.304 115.525C107.304 119.774 104.907|M108.838 108.386C108.838 109.298 107.2 1|M63.4033 104.05C59.1097 103.38 54.8161 1|M117.047 103.052C112.702 102.794 108.408|M35.5382 106.768C35.5382 106.768 34.1933|M127.255 106.063C127.255 106.063 128.6 1|M127.514 122.197C131.686 109.95 130.479",
        "Famous"
      ]
    ].map(([sig, name]) => [normalizeSignature(sig), name])
  );

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const ABILITY_MAP = new Map();
  const ABILITY_MATCHERS = [];

  for (const ability of ABILITIES) {
    const names = [ability.name, ...(ability.variants || [])];
    for (const label of names) {
      const key = normalize(label);
      if (!key) continue;
      ABILITY_MAP.set(key, ability.type);
      ABILITY_MATCHERS.push({
        key,
        type: ability.type,
        regex: new RegExp(`\\b${escapeRegex(key)}\\b`, "i")
      });
    }
  }

  function getCandidateStrings(el) {
    const out = [];
    for (const attr of ABILITY_ATTRS) {
      const val = el.getAttribute && el.getAttribute(attr);
      if (val) out.push(val);
    }

    const describedBy = el.getAttribute && el.getAttribute("aria-describedby");
    if (describedBy) {
      const tooltip = document.getElementById(describedBy);
      const text = (tooltip?.textContent || "").trim();
      if (text) out.push(text);
    }

    const text = (el.textContent || "").trim();
    if (text && text.length <= 24) out.push(text);

    const tag = (el.tagName || "").toLowerCase();

    if (tag === "img") {
      const src = el.getAttribute("src") || "";
      if (src) {
        const file = src.split("/").pop().split("?")[0] || "";
        if (file) {
          const name = file.replace(/\.[a-z0-9]+$/i, "");
          out.push(name);
        }
      }
    }

    if (tag === "svg") {
      const useEl = el.querySelector && el.querySelector("use");
      const href =
        useEl?.getAttribute?.("href") || useEl?.getAttribute?.("xlink:href") || "";
      if (href) {
        const ref = href.split("#").pop() || "";
        if (ref) out.push(ref);

        const file = href.split("/").pop().split("?")[0] || "";
        if (file) out.push(file.replace(/\.[a-z0-9]+$/i, ""));
      }
    }

    return out;
  }

  function isLabeledElement(el) {
    if (!el || !el.getAttribute) return false;
    return ABILITY_ATTRS.some((attr) => el.hasAttribute(attr));
  }

  function getSvgSignature(svg) {
    if (!svg || (svg.tagName || "").toLowerCase() !== "svg") return "";
    if (svg.dataset?.cplAbilitySig) return svg.dataset.cplAbilitySig;
    const parts = Array.from(svg.querySelectorAll("path")).map((path) =>
      (path.getAttribute("d") || "").slice(0, 40)
    );
    if (!parts.length) return "";
    const sig = normalizeSignature(parts.join("|"));
    if (sig) svg.dataset.cplAbilitySig = sig;
    return sig;
  }

  function resolveAbilityType(el) {
    const candidates = [];
    const seen = new Set();
    const tag = (el?.tagName || "").toLowerCase();

    const addCandidates = (node) => {
      if (!node) return;
      for (const raw of getCandidateStrings(node)) {
        const key = normalize(raw);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        candidates.push(key);
      }
    };

    addCandidates(el);

    if (el.closest) {
      const labeledParent = el.closest(ABILITY_ATTR_SELECTOR);
      if (labeledParent && labeledParent !== el) addCandidates(labeledParent);
    }

    if (tag !== "img" && tag !== "svg") {
      const childIcon = el.querySelector?.("img, svg");
      if (childIcon && childIcon !== el) addCandidates(childIcon);
    }

    for (const key of candidates) {
      const direct = ABILITY_MAP.get(key);
      if (direct) return direct;

      for (const matcher of ABILITY_MATCHERS) {
        if (matcher.regex.test(key)) return matcher.type;
      }
    }
    return null;
  }

  function resolveAbilityTypeFromSignature(el) {
    if (!el || (el.tagName || "").toLowerCase() !== "svg") return null;
    const sig = getSvgSignature(el);
    if (!sig) return null;
    const abilityName = SVG_SIGNATURE_ABILITY.get(sig);
    if (!abilityName) return null;
    return ABILITY_MAP.get(normalize(abilityName)) || null;
  }

  function applyBorder(el, type) {
    if (!el || !type) return;

    let target = null;
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "img" || tag === "svg") {
      const iconBox = el.closest?.("div[style*='background-image']");
      target = iconBox || el;
    } else if (isLabeledElement(el)) {
      target = el;
    } else {
      target = el.querySelector?.("img, svg") || el;
    }

    if (!target) return;

    if (target.dataset.cplAbilityBorder === type) return;

    target.classList.remove(
      "cpl-ability-border--positive",
      "cpl-ability-border--negative",
      "cpl-ability-border--mixed"
    );

    target.classList.add("cpl-ability-border", `cpl-ability-border--${type}`);
    target.dataset.cplAbilityBorder = type;
  }

  function scan(root) {
    const scope = root || document;
    if (!scope.querySelectorAll) return;

    const selector = ["img", "svg", ABILITY_ATTR_SELECTOR].join(",");

    const nodes = scope.querySelectorAll(selector);
    nodes.forEach((el) => {
      const tag = (el.tagName || "").toLowerCase();
      if ((tag === "img" || tag === "svg") && el.closest) {
        const labeledParent = el.closest(ABILITY_ATTR_SELECTOR);
        if (labeledParent && labeledParent !== el) return;
      }
      let type = resolveAbilityType(el);
      if (!type && tag === "svg") {
        type = resolveAbilityTypeFromSignature(el);
      }
      if (type) applyBorder(el, type);
    });
  }

  window.CPLEnhancer.initAbilityBorders = function initAbilityBorders() {
    let scheduled = false;
    let lastUrl = location.href;

    const run = (root) => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        try {
          scan(root);
        } catch (e) {
          console.warn("[CPL Enhancer] ability borders failed:", e);
        }
      }, 120);
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run(document));
    } else if (typeof window.CPLEnhancer.observe === "function") {
      window.CPLEnhancer.observe("body", () => run(document));
    } else {
      run(document);
    }

    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        run(document);
      }
    }, 300);

    run(document);
  };
})();
