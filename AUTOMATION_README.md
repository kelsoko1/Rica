# Rica Automation with Activepieces

This guide explains how to use the Automation (Auto) feature in Rica, powered by Activepieces.

## Overview

Activepieces is an open-source automation platform that allows you to create workflows and automate tasks across different services. It's integrated into Rica as the "Auto" tab in the left sidebar.

## Features

- **Visual Workflow Builder**: Create automation workflows with a drag-and-drop interface
- **Pre-built Integrations**: Connect to 100+ apps and services
- **Custom Code**: Write custom JavaScript/TypeScript code for advanced automation
- **Triggers & Actions**: Set up event-based triggers and automated actions
- **Scheduling**: Run workflows on a schedule (cron jobs)
- **Webhooks**: Trigger workflows via HTTP webhooks
- **Data Transformation**: Transform and manipulate data between steps

## Getting Started

### 1. Access Activepieces

Click on the **Auto** button in the Rica left sidebar to open the Activepieces interface.

### 2. First-Time Setup

When you first access Activepieces, you'll need to:

1. Create an admin account
2. Set up your workspace
3. Configure any necessary integrations

### 3. Create Your First Flow

1. Click "Create Flow" in the Activepieces dashboard
2. Give your flow a name and description
3. Add a trigger (e.g., webhook, schedule, or app event)
4. Add actions to perform when the trigger fires
5. Test your flow
6. Activate it

## Common Use Cases

### Security Automation

- **Threat Response**: Automatically respond to security threats detected by OpenCTI
- **Alert Notifications**: Send alerts to Slack, Teams, or email when threats are detected
- **Data Enrichment**: Enrich threat intelligence data from multiple sources
- **Report Generation**: Generate and distribute security reports on a schedule

### Simulation Automation

- **Scheduled Simulations**: Run OpenBAS simulations on a schedule
- **Result Processing**: Process simulation results and generate reports
- **Team Notifications**: Notify teams about simulation exercises
- **Metrics Collection**: Collect and aggregate simulation metrics

### Data Integration

- **API Integration**: Connect Rica with external APIs
- **Data Sync**: Sync data between Rica and other platforms
- **Backup Automation**: Automate data backups
- **Log Aggregation**: Collect and process logs from multiple sources

## Configuration

### Environment Variables

The following environment variables can be configured in `docker-compose.prod.yml`:

```yaml
- AP_API_KEY: API key for Activepieces (change in production)
- AP_ENCRYPTION_KEY: Encryption key for sensitive data (change in production)
- AP_JWT_SECRET: JWT secret for authentication (change in production)
- AP_FRONTEND_URL: URL where Activepieces is accessible (default: http://localhost:2022)
- AP_POSTGRES_PASSWORD: Database password
- AP_REDIS_PASSWORD: Redis password
```

### Database

Activepieces uses PostgreSQL for data storage. The database is automatically created when you start the stack.

### Redis

Activepieces uses Redis for caching and job queuing.

## Integration with Rica Services

### OpenCTI Integration

You can create flows that:
- Monitor OpenCTI for new threats
- Create indicators in OpenCTI from external sources
- Export threat intelligence data
- Trigger actions based on threat severity

### OpenBAS Integration

You can create flows that:
- Schedule and run simulations
- Process simulation results
- Generate reports
- Notify teams about exercises

### Swarm Browser Integration

You can create flows that:
- Automate browser tasks
- Scrape data from websites
- Monitor web pages for changes
- Take screenshots and generate reports

## Security Best Practices

1. **Change Default Credentials**: Update all default passwords and secrets in production
2. **Use HTTPS**: Configure HTTPS for secure access
3. **Limit Access**: Restrict access to Activepieces to authorized users only
4. **Secure Webhooks**: Use authentication for webhook endpoints
5. **Audit Logs**: Regularly review automation logs for suspicious activity
6. **Backup Flows**: Export and backup your automation flows regularly

## Troubleshooting

### Activepieces Not Loading

1. Check if the container is running:
   ```bash
   docker ps | grep activepieces
   ```

2. Check the logs:
   ```bash
   docker logs activepieces
   ```

3. Verify PostgreSQL and Redis are healthy:
   ```bash
   docker ps | grep -E "postgres|redis"
   ```

### Database Connection Issues

1. Ensure PostgreSQL is running and healthy
2. Check database credentials in docker-compose.prod.yml
3. Verify the database was created:
   ```bash
   docker exec -it postgres psql -U postgres -c "\l"
   ```

### Performance Issues

1. Increase container resources if needed
2. Check Redis memory usage
3. Review flow complexity and optimize if necessary
4. Monitor database performance

## Advanced Configuration

### Custom Pieces (Integrations)

You can create custom pieces for Activepieces to integrate with proprietary systems or add custom functionality.

### Scaling

For high-volume automation:
- Increase worker instances
- Configure Redis for better performance
- Optimize database queries
- Use external queue systems

## Resources

- [Activepieces Documentation](https://www.activepieces.com/docs)
- [Activepieces GitHub](https://github.com/activepieces/activepieces)
- [Community Forum](https://community.activepieces.com/)

## Support

For issues specific to Rica integration:
- Check the Rica documentation
- Review Docker logs
- Contact Rica support

For Activepieces-specific issues:
- Visit the Activepieces documentation
- Join the community forum
- Report bugs on GitHub
