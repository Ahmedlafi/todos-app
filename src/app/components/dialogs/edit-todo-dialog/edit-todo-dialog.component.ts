import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TodosService, Todo } from '../../../services/todos.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-edit-todo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-todo-dialog.component.html',
  styleUrls: ['./edit-todo-dialog.component.css'],
})
export class EditTodoDialogComponent {
  todo: Todo;
  loading = false;
  deleting = false;

  constructor(
    public dialogRef: MatDialogRef<EditTodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todo },
    private todosService: TodosService,
    private dialog: MatDialog
  ) {
    this.todo = { ...data.todo };
  }

  toggleComplete() {
    this.loading = true;
    const newStatus = !this.todo.completed;
    this.todosService.updateTodo(this.todo.id, newStatus).subscribe({
      next: (updatedTodo) => {
        this.todo = updatedTodo;
        this.loading = false;
        this.dialogRef.close({ action: 'updated', todo: updatedTodo });
      },
      error: (err) => {
        this.loading = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: 'Error',
            message: 'Failed to update task status. Please try again.',
            type: 'error',
          },
        });
      },
    });
  }

  deleteTodo() {
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
      if (result) {
        this.deleting = true;
        this.todosService.deleteTodo(this.todo.id).subscribe({
          next: () => {
            this.deleting = false;
            this.dialogRef.close({ action: 'deleted', todoId: this.todo.id });
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

  close() {
    this.dialogRef.close();
  }
}
