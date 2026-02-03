module.exports = {
  apps: [{
    name: "identity-service",
    script: "./src/server.js",
    instances: "max",       // Uses all available CPU cores
    exec_mode: "cluster",   // ENABLES CLUSTER MODE
    watch: false,           // Watch mode is usually disabled in production
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}