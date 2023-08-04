module.exports = {
  apps : [{
    name      : "EMLC",
    script    : "./server.js",
    instances : "max",
    exec_mode : "cluster",
    watch     : true,
    env: {
        "NODE_ENV": "development",
        "PORT": '8484',
        "HOST": '1.1.1.1'
    },
    env_production : {
        "NODE_ENV": "production",
        "PORT": '4200',
        "HOST": '0.0.0.0'
    }
  }]
};
