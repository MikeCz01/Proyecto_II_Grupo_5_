import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'simulador-procesos';

  constructor(private titleService  : Title,
              private router        : Router,
              private route         : ActivatedRoute) { }


  ngOnInit(): void {
    const appTitle = this.titleService.getTitle();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.route.firstChild;

        while (child?.firstChild) {
          child = child.firstChild;
        }

        const customTitle = child?.snapshot.data['title'];

        return customTitle ?
          ` ${customTitle} | Simulador de procesos` : appTitle;
      })
    ).subscribe((newTitle: string) => this.titleService.setTitle(newTitle));
  }
}
