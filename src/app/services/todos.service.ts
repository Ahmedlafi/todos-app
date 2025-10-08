import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Todo {
  id: string
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private apiUrl = environment.todosApiUrl;

  constructor(private http: HttpClient) {}

  getTodos(): Observable<TodosResponse> {
    return this.http.get<Todo[]>(this.apiUrl).pipe(
      map(todos => ({
        todos: todos.map(todo => ({
          ...todo,
          id: String(todo.id)
        })),
        total: todos.length,
        skip: 0,
        limit: 10,
      }))
    );
  }

  getTodoById(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`).pipe(
      map(todo => ({
        ...todo,
        id: String(todo.id)
      }))
    );
  }

  updateTodo(id: string, completed: boolean): Observable<Todo> {
    return this.http.patch<Todo>(
      `${this.apiUrl}/${id}`,
      { completed },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map(todo => ({
        ...todo,
        id: String(todo.id)
      }))
    );
  }

  addTodo(todo: string, userId: number = 1): Observable<Todo> {
    const uniqueId = `todo_${Date.now()}_${Math.random().toString(36)}`;

    const newTodo: Todo = {
      id: uniqueId,
      todo,
      completed: false,
      userId,
    };

    return this.http.post<Todo>(
      this.apiUrl,
      newTodo,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map(createdTodo => ({
        ...createdTodo,
        id: createdTodo.id || uniqueId
      }))
    );
  }

  deleteTodo(id: string): Observable<Todo> {
    return this.http.delete<Todo>(`${this.apiUrl}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(todo => ({
        ...todo,
        id: String(todo.id)
      }))
    );
  }
}
