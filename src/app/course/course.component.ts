import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {Course} from "../model/course";
import {CoursesService} from "../services/courses.service";
import {debounceTime, distinctUntilChanged, startWith, tap, delay, catchError, finalize} from 'rxjs/operators';
import {merge, fromEvent, throwError} from 'rxjs';
import {Lesson} from '../model/lesson';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit, AfterViewInit {

    course:Course;

    lessons :Lesson[]=[];

    displayedColumns=['seqNo' , "description", "duration"];

    loading=false;

    //PRIMEIRA REFERENCIA DO NOSSO Template
    @ViewChild(MatPaginator)
    paginator:MatPaginator;

    //PEGAR A REFERENCIA DO NOSSO MAT SORT QUE TA NO NOSSO COMPLETO
    @ViewChild(MatSort)
    sort:MatSort;

  //PRECISAMOS DETECTAR A PRESENÇA DE EVENTOS DO NOSSO PAGINATOR
  //NO CICLO DE VIDA DO COMPONENTE


    constructor(private route: ActivatedRoute,
                private coursesService: CoursesService) {

    }

    //NAO SERA FEITO NO NGINIT PQ NÃO VAI SER CIRADO AGORA
    ngOnInit() {

        this.course = this.route.snapshot.data["course"];

        this.loadLessonsPage();


    }

  loadLessonsPage(){
      this.loading=true;
      this.coursesService.findLessons(this.course.id,this.sort?.direction ?? "asc",this.paginator?.pageIndex ?? 0,this.paginator?.pageSize ?? 3,this.sort?.active ?? "seqNo")
        .pipe(
          tap(lessons =>this.lessons=lessons),
          catchError(err=>{
            console.log("Error loading lessons",err);
            alert("Error loading lessons");

            return throwError(err);
          }),
          //isso e idendepentemente do observable ter sido concluido ou ter dado erro,ou quando ter dado
          //o cancelamento da inscrição
          finalize(
            ()=>this.loading=false
          )

        ).
      subscribe();

  }

    //SERA AQUI
    ngAfterViewInit() {
      this.sort.sortChange.subscribe(()=> this.paginator.pageIndex=0);

      //VAMOS COMBINAR OS DOIS OBSERVABLES
      merge(this.sort.sortChange,this.paginator.page).pipe(
        tap(()=>this.loadLessonsPage())
      ).subscribe();
    }

}
