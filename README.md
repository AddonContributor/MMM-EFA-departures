# VVS Fork of MMM-EFA-departures
This is a fork of MMM-EFA-departures. I want to help using this module for Stuttgart.

MagicMirror² module to show departures for public transport stations using the EFA system.

**Example Configuration for Düsseldorf HBF/Main Station:**
```
{
    module: 'MMM-EFA-departures',
    position: 'top_right',
    config: {
        efaUrl: "http://efa.vvs.de/vvs/XSLT_DM_REQUEST",
        stopID: "5006112",                                 //Stuttgart, Hauptbahnhof, for your stopID for VVS see below
        stopName: "Loading",                               //initial module name
        lines: ['all'],                                    //lines: ['vvs:10001: :H','vvs:10001: :R'], would show the line S1 in both directions
        reload: 60000,                                     //interval in ms (60000=60s)
        realDepTime: true,                                 //use real-time data
        relativeDepTime: true,                             // When "toggle" is disabled change between absolute/relative Time,not implemented yet
        toggleDepTime: true,                               //Toggle relative/absolute time
        toggleDepTimePerReload: 6,                         //Every 10 seconds
        fade: true,                                        //fade brightness
        fadePoint: 0.25,                                   //Start on 1/4th of the list. (1/maxDepartures would be ideal)
        maxDepartures: 4                                   //maximum amount of departures displayed
    }
},
```

## **Getting Line IDs for VVS**

The following scripts are optimized for Mac OS. Minor adaptions are needed to make it work on linux, i.e. the linux version of sed does not require the empty string argument.

```
rm VVSLinien.txt
# Adapt the following array if needed
array=( S1 S11 S2 S3 S4 S5 S6 S60 U1 U2 U3 U4 U5 U6 U7 U8 U9 U10 U11 U12 U13)
for i in "${array[@]}"
do
    rm temp.txt
    rm temp2.txt
    curl 'http://www2.vvs.de/vvs/XSLT_ROP_REQUEST' -H 'Host: www2.vvs.de' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: de,en-US;q=0.7,en;q=0.3' --compressed -H 'Referer: http://www2.vvs.de/vvs/XSLT_ROP_REQUEST?language=de&mode=odv' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' --data 'sessionID=0&requestID=0&language=de&command=&mode=line&net=&opBranch=&execInst=normal&mergeSup=0&mergeDir=1&lineName='$i'&efaResult=submit' > temp.txt
    grep "vvs\:[0-9][0-9][0-9][0-9][0-9]\:\s\:H" temp.txt > temp2.txt
    sed -i '' $'s/></\\\n/g' temp2.txt
    grep "vvs\:[0-9][0-9][0-9][0-9][0-9]\:\s\:H" temp2.txt > temp.txt
    sed -i '' $'s/option value="//g' temp.txt
    sed -i '' $'s/" selected="selected">/ /g' temp.txt
    sed -i '' $'s/">/ /g' temp.txt
    sed -i '' 's@</option@ @g' temp.txt
    sed -i '' 's@:j[0-9][0-9]:[0-9][0-9]*_[0-9]@@g' temp.txt
    sed -i '' 's@:j[0-9][0-9]:[0-9][0-9]*_[0-9]@@g' temp.txt
    cat temp.txt >> VVSLinien.txt
done
rm temp.txt
rm temp2.txt

```

## **Getting Stop IDs for VVS**

```
rm VVSHaltestellen.txt
# Adapt the following array if needed
array=(Hauptbahnhof, Herrenberg, Flughafen, Filderstadt, Kirchheim, Schorndorf, Waiblingen, Backnang, Bietigheim, Weil der Stadt, Böblingen)
for i in "${array[@]}"
do
    rm temp.txt
    rm temp2.txt
    curl 'http://efa.vvs.de/vvs/XSLT_STOPFINDER_REQUEST?jsonp=func&suggest_macro=vvs&name_sf='$i -H 'Host: efa.vvs.de' -H 'Accept: text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01' -H 'Accept-Language: de,en-US;q=0.7,en;q=0.3' --compressed -H 'Referer: http://efa.vvs.de/vvs/XSLT_STT_REQUEST?language=de' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > temp.txt
    sed -i '' $'s/}, {/},\\\n{/g' temp.txt
    sed -i '' $'s/"points":/\\\n/g' temp.txt
    grep '{ "usage":"sf", "type":"any", "name":"' temp.txt > temp2.txt
    grep '"stateless"\:"[0-9]' temp2.txt > temp.txt
    sed -i '' $'s@, "anyType":"stop",.*$@ @g' temp.txt
    sed -i '' $'s@{ "usage":"sf", "type":"any", "name":@ @g' temp.txt
    sed -i '' $'s@, "stateless":@ stop id: @g' temp.txt
    cat temp.txt >> VVSHaltestellen.txt
done
rm temp.txt
rm temp2.txt
```
