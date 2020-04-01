import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import qs from 'qs';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeocoderLayer } from './layer.model';
import { ConfigService } from '@backend/config';

export class AutocompleteParams {
  @IsString()
  @ApiProperty()
  public text: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ default: 10 })
  public size?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  public focusLatitude?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  public focusLongitude?: number;

  @IsEnum(GeocoderLayer)
  @IsOptional()
  @ApiPropertyOptional({
    enum: GeocoderLayer,
    description:
      'See https://github.com/pelias/documentation/blob/master/autocomplete.md#layers',
  })
  public layer?: GeocoderLayer;
}

export class AutocompleteResult {
  @ApiProperty()
  public label: string;

  @ApiProperty()
  public latitude: number;

  @ApiProperty()
  public longitude: number;
}

@Injectable()
export class GeocoderService {
  private peliasHttpInstance = Axios.create({
    baseURL: this.config.peliasUrl,
  });

  constructor(private config: ConfigService) {}

  public async autocomplete(
    params: AutocompleteParams
  ): Promise<AutocompleteResult[]> {
    const url = `/v1/search?${qs.stringify({
      ...params,
      text: params.text,
      'focus.point.lat': params.focusLatitude,
      'focus.point.lon': params.focusLongitude,
      layers: params.layer,
    })}`;
    const result = await this.peliasHttpInstance.get(url);
    return result.data.features.map((feature: any) => ({
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
      label: feature.properties.label,
      layer: feature.properties.layer,
    }));
  }
}
