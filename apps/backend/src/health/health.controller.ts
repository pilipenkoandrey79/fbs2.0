import { Controller, Get } from "@nestjs/common";
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get("live")
  @HealthCheck()
  live() {
    return this.health.check([
      () => this.http.pingCheck("nestjs-docs", "https://docs.nestjs.com"),
    ]);
  }

  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([() => this.db.pingCheck("database")]);
  }
}
