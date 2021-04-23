const appConfigBuilder = (env) => {
  switch (env) {
    case "production":
      return {
        baseUrl:
          "http://schools-nlb-7fbed238676b3240.elb.us-east-2.amazonaws.com/api",
        mapStyle:
          "http://schools-nlb-7fbed238676b3240.elb.us-east-2.amazonaws.com/styles/klokantech-basic/style.json",
      };

    case "development":
      return {
        baseUrl:
          "http://schools-nlb-7fbed238676b3240.elb.us-east-2.amazonaws.com/api",
        mapStyle:
          "http://schools-nlb-7fbed238676b3240.elb.us-east-2.amazonaws.com/styles/klokantech-basic/style.json",
      };
    default:
      return {
        baseUrl:
          "http://schools-nlb-7fbed238676b3240.elb.us-east-2.amazonaws.com/api",
        mapStyle:
          "http://schools-nlb-7fbed238676b3240.elb.us-east-2.amazonaws.com/styles/klokantech-basic/style.json",
      };
  }
};

export default appConfigBuilder;
