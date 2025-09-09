module.exports = {
  apps: [
    {
      name: "frontend",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/frontend",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "15G",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      error_file: "/var/log/pm2/frontend-error.log",
      out_file: "/var/log/pm2/frontend-out.log",
      merge_logs: true,
    },
  ],
};
