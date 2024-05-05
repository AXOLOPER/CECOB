module.exports = {
  apps: [
    {
      	"name": "incripciones",
        "cwd": "./",
        "script": "./index.js",
      	instances: 2,
      	max_memory_restart: "3000M",

      // Logging
      out_file: "./out.log",
      error_file: "./error.log",
      merge_logs: true,
      log_date_format: "DD-MM HH:mm:ss Z",
      log_type: "json",

      // Env Specific Config
      env_production: {
        NODE_ENV: "production",
        PORT: 1000,
        exec_mode: "cluster_mode",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        watch: true,
        watch_delay: 3000,
        ignore_watch: [
          "./node_modules",
          "./app/views",
          "./public",
          "./.DS_Store",
          "./package.json",
          "./yarn.lock",
          "./samples",
          "./src"
        ],
      },
    },
  ],
};
