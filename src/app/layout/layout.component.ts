import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, map } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  public appTitle: string = '';
  public title: BehaviorSubject<string>;
  private clickCount = 0;

  constructor(private titleService: Title,
              private router        : Router,
              private route         : ActivatedRoute) {
  }

  ngOnInit(): void {
    this.appTitle = this.titleService.getTitle();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.route.firstChild;

        while (child?.firstChild) {
          child = child.firstChild;
        }

        const customTitle = child?.snapshot.data['title'];

        return customTitle ?
          ` ${customTitle} | Simulador de procesos` : 'Simulador de procesos';
      })
    ).subscribe((newTitle: string) => this.appTitle = newTitle);
  }

  public credits(){
    console.log('Click');
    this.clickCount++;
    if(this.clickCount >= 3){
      this.router.navigate(['credits']);
      this.clickCount = 0;
    }
  }

}
