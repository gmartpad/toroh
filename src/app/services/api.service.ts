import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment' 

export interface Flashcard {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:' + environment.backend_port; // Backend running on port 8080
 
  constructor(private http: HttpClient) { }

  uploadDocumentAndGetFlashcards(file: File): Observable<Flashcard[]> {
    const formData = new FormData();
    formData.append('documentFile', file); // 'documentFile' matches the field name expected by your backend

    return this.http.post<Flashcard[]>(`${this.apiUrl}/api/generate-flashcards`, formData);
  }
}