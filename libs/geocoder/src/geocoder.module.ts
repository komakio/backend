import { Module } from '@nestjs/common';
import { GeocoderService } from './geocoder.service';
import { AutocompleteController } from './controllers/autocomplete.controller';
import { ConfigModule } from '@backend/config';

@Module({
  controllers: [AutocompleteController],
  providers: [GeocoderService],
  imports: [ConfigModule],
})
export class GeocoderModule {}
