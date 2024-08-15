import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  const config: ConfigService = app.get(ConfigService);
  const port = config.get<number>("VITE_BACKEND_PORT") || 3333;
  const globalPrefix = config.get<string | undefined>("VITE_API_PREFIX");

  const swaggerConfig = new DocumentBuilder()
    .addServer(globalPrefix)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());

  SwaggerModule.setup("swagger", app, document, {
    jsonDocumentUrl: "swagger/json",
    yamlDocumentUrl: "swagger/yaml",
  });

  await app.listen(port, () => {
    Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
  });
}

bootstrap();
