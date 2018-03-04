rm VVSHaltestellen.txt
array=(Hauptbahnhof, Herrenberg, Flughafen, Filderstadt, Kirchheim, Schorndorf, Waiblingen, Backnang, Bietigheim, Weil der Stadt, Böblingen)
#array=(Herrenberg)
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