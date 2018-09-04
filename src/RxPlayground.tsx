// tslint:disable:no-console
// tslint:disabl:ordered-imports
import * as React from "react";
import {
  ConnectableObservable,
  from,
  merge,
  Observable,
  of,
  timer
} from "rxjs";
import {
  // bufferCount,
  concatMap,
  // filter,
  delay,
  map,
  // publish,
  // shareReplay,
  mergeMap,
  take,
  tap
} from "rxjs/internal/operators";

// import { componentFromStream } from 'recompose';

/// Timer for console
timer(1000, 1000)
  .pipe(take(100))
  .subscribe(val => console.log("timer: ", val));
// const hot = t.pipe(publish()) as ConnectableObservable<number>;
// hot.connect();
// hot.subscribe(val => console.log("timer: ", val));

type Ad = {
  readonly id: string;
  readonly refreshed: boolean;
  readonly auctioned: boolean;
  readonly visible: boolean;
};

// Simulates random timing for network requests
function randomTimeout(): number {
  return Math.floor(Math.random() * 4000) + 200;
}

// Simulates a network request by adding a timer ignore the hackery
function networkRequest(
  ad: Ad,
  field: "refreshed" | "auctioned" | "visible"
): Observable<Ad> {
  const newAd = {};
  // tslint:disable-next-line:no-object-mutation
  newAd[field] = true;
  return of(ad)
    .pipe(delay(randomTimeout()))
    .pipe(
      map(delayedAd => {
        return { ...delayedAd, ...newAd };
      })
    )
    .pipe(
      tap(refreshedAd => {
        console.log("-- Ad refreshed:", refreshedAd);
      })
    );
}

// Simulates an auction, all the bids are sent out at once
function runAuction(ads: ReadonlyArray<Ad>): Observable<Ad> {
  return from(ads)
    .pipe(mergeMap(item => of(item).pipe(delay(randomTimeout()))))
    .pipe(map(ad => ({ ...ad, auctioned: true })));
  // .pipe(tap(res => console.log("- Auction result for:", res)));
}

function refreshAd(ad: Ad): Observable<Ad> {
  return networkRequest(ad, "refreshed");
}

function showAd(ads: ReadonlyArray<Ad> | Ad): Observable<Ad> {
  console.log("ads: ", ads);
  const adsArray = Array.isArray(ads) ? ads : [ads];
  const adObservables = adsArray.map(ad => {
    return of({
      ...ad,
      refreshed: false,
      visible: true
    }).pipe(tap(res => console.log("- Ad visible:", res)));
  });

  return merge(...adObservables);
}

// THIS IS WHERE THE MAGIC IS
function onLoad(ads: ReadonlyArray<string>): Observable<Ad> {
  const adObjects: ReadonlyArray<Ad> = ads.map(id => {
    return {
      auctioned: false,
      id,
      refreshed: false,
      visible: false
    };
  });

  return runAuction(adObjects)
    .pipe(mergeMap(ad => refreshAd(ad)))
    .pipe(mergeMap(refreshedAd => showAd(refreshedAd)))
    .pipe(mergeMap(ad => refreshAd(ad)))
    .pipe(delay(20000))
    .pipe(concatMap(() => onLoad(ads))); // After 20 seconds reload all the ads again
}

const newAds: ReadonlyArray<string> = ["ad-1", "ad-2", "ad-3", "ad-4"];
const refreshedAds$ = onLoad(newAds) as ConnectableObservable<Ad>;
refreshedAds$.subscribe({
  complete: () => {
    console.log("onLoadSub: COMPLETE");
  },
  next: ad => {
    console.log("onLoadSub: ", ad);
  }
});

export default function rxPlayground(props: Ad): JSX.Element {
  return (
    <React.Fragment>
      <h1>{props.id}</h1>
      <h1>92% of People Don't Understand How Cool Functional Programming Is</h1>
      <h2>
        How cool is functional programming? Check the console because I didn't
        do any CSS
      </h2>
    </React.Fragment>
  );
}
