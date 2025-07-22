import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      // logger: ["error", "warn", "log", "verbose", "debug"],
      logger: false,
      cors: true,
    }
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
