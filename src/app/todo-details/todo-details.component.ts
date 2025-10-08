import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { TodosService, Todo } from '../services/todos.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../dialogs/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-todo-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './todo-details.component.html',
  styleUrl: './todo-details.component.css',
})
export class TodoDetailsComponent implements OnInit {
  todo: Todo | null = null;
  loading = true;
  error = false;
  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todosService: TodosService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchTodoDetails(id);
    }
  }

  fetchTodoDetails(id: string) {
    this.todosService.getTodoById(id).subscribe({
      next: (todo) => {
        this.todo = todo;
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/todos']);
  }

  toggleComplete() {
    if (this.todo) {
      const newStatus = !this.todo.completed;
      this.todosService.updateTodo(this.todo.id, newStatus).subscribe({
        next: (updatedTodo) => {
          this.todo = updatedTodo;
        },
        error: (err) => {},
      });
    }
  }

  deleteTodo() {
    if (!this.todo) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message:
          'Are you sure you want to delete this task? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.todo) {
        this.deleting = true;
        this.todosService.deleteTodo(this.todo.id).subscribe({
          next: () => {
            this.deleting = false;
            this.router.navigate(['/todos']);
          },
          error: (err) => {
            this.deleting = false;
            this.dialog.open(AlertDialogComponent, {
              data: {
                title: 'Error',
                message: 'Failed to delete the task. Please try again.',
                type: 'error',
              },
            });
          },
        });
      }
    });
  }
}
