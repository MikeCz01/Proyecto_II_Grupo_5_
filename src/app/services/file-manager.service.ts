import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppendRequest, FileRequest, GetFirstResponse, OkResponse } from '../models/file.system.models';
import { BCPMemory } from '../models/process.model';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private files = environment.fileSystem;

  constructor(private http : HttpClient) {}

  public createFile(filename : string) : Promise<boolean>{
    const body : FileRequest = {
      filename: filename
    };
    return new Promise(async(resolve, reject) => {
      try{
        const request = this.http.post<OkResponse>(this.files + '/create', body);
        const status = await lastValueFrom(request);
        resolve(status.ok);
      }catch{
        resolve(false);
      }
    });
  }

  public appendProcess(filename : string, process : BCPMemory) : Promise<boolean>{
    const body : AppendRequest = {
      filename: filename,
      process: process
    };

    return new Promise(async(resolve, reject) => {
      try{
        const request = this.http.post<OkResponse>(this.files + '/append', body);
        const status = await lastValueFrom(request);
        resolve(status.ok);
      }catch{
        resolve(false);
      }
    });
  }

  public getSuspendedProcess(filename : string) : Promise<BCPMemory | null>{
    const body : FileRequest = {
      filename: filename
    };
    return new Promise(async(resolve, reject) => {
      try{
        const request = this.http.put<GetFirstResponse>(this.files + '/get-first', body);
        const response = await lastValueFrom(request);
        if(!response.ok || !response.process){
          resolve(null);
        }
        resolve(response.process!);
      }catch{
        resolve(null);
      }
    });
  }

  public generateFilename() : string{
    const date = new Date().toISOString().split(".")[0].replace(/T|:|-/g,'');
    return `procesos-suspendidos-${date}.json`;
  }
}
