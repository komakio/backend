import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import qs from 'qs';
import { AutocompleteParams, AutocompleteResult } from './layer.model';
import { ConfigService } from '@backend/config';

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
      countryIsoCode: feature.properties.country_a,
      city: feature.properties.locality,
    }));
  }
}
