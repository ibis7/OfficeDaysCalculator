Yay, let's calculate how many days you have to go to the office this week (might completely fail).

To execute, either clone the files and run locally as any Angular app or:

1. Download dist/office-days-app/office-days-app.zip
2. Uncompress
3. Open folder in CMD (where the index.html is located)
4. Run: python -m http.server 8080
5. Go to http://localhost:8080/

To upload a new version

1. Run ng serve to test locally
2. Run ng build --configuration production --base-href "/OfficeDaysCalculator/dist/office-days-app/browser/"
