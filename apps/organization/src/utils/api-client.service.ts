import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApiClientService {
	constructor(private readonly httpService: HttpService) {}

	async get<T>(url: string, config?: any): Promise<T> {
		try {
			const response = await lastValueFrom(this.httpService.get<T>(url, config));
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async post<T>(url: string, data: any, config?: any): Promise<T> {
		try {
			const response = await lastValueFrom(this.httpService.post<T>(url, data, config));
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async put<T>(url: string, data: any, config?: any): Promise<T> {
		try {
			const response = await lastValueFrom(this.httpService.put<T>(url, data, config));
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async delete<T>(url: string, config?: any): Promise<T> {
		try {
			const response = await lastValueFrom(this.httpService.delete<T>(url, config));
			return response.data;
		} catch (error) {
			throw new HttpException(error.message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
