# Bulk Add and Update Venues to Foursquare

<br>

This app allows you to programmatically [add](https://developer.foursquare.com/docs/api/venues/add) and [update](https://developer.foursquare.com/docs/api/venues/proposededit) Foursquare venues from a CSV file using the command line.

To use this app, first run:

```bash
npm install
```

<br>

## Command Options

There are two command options to use when running the app:

- `upload`
- `update`

Use `upload` when you want to add new venues and `update` when you want to propose an edit to existing venues.

<br>

Along with the command, you need to include three required flags:

- `--file`
- `--output`
- `--token`

The `file` flag should be set to the file path of the input file of venue data and attributes for which you would like to add/update. The `output` flag is the file path for where you would like to send the add/update results (the resulting file will include new venue IDs, response codes, etc.). The `token` flag is where you set your OAuth token. If you do not have a token already, please generate one by following the instructions [here](https://developer.foursquare.com/docs/api/configuration/authentication).

<br>

## Preparing the Input File

In order to prepare the input file, please create a new file in your directory. In the file, the first row can include any of the possible venue parameters as listed [here](https://developer.foursquare.com/docs/api/venues/add) (for adding venues) and [here](https://developer.foursquare.com/docs/api/venues/proposededit) (for proposing edits to existing venues). Please note the required parameters (i.e., `name`, `ll`, and `primaryCategoryId` for adding venues).

Each following row represents one venue's parameters. Example file (for adding venues):

```
name	address	city	state	zip	ll	primaryCategoryId
Simply Fitness	2432E Main St	Jackson	MO	63755	37.381627,-89.640652	4bf58dd8d48988d175941735
Studio Meraki	101 N Main St Suite 3A	Fairfield	IA	52556	41.0076,-91.96366	4bf58dd8d48988d175941735
The Camp Transformation Center	7814 NW 44th St	Sunrise	FL	33351	26.17916,-80.25315	4bf58dd8d48988d175941735
```

<br>

## Running the App

Once you have prepared your input file, run your app by using this command:

**For adding venues:**

```bash
node index.js upload --file=./your_input_file.csv --output=./your_output_file --token=your_token
```

**For updating venues:**

```bash
node index.js update --file=./your_input_file.csv --output=./your_output_file --token=your_token
```

<br>

:warning: _Do not run the same file more than once because this could create duplicates in the Foursquare system. After you get your response file back, you can check for errors and create a new input file for venues that errored out._

<br>

## Response Codes

- `200` - Upload/update was a success
- `400` - Upload/updated failed (will come with an error message)
- `409` (upload only) - Venue was not uploaded because there is a duplicate in the system
- `500` - There was a Foursquare server error
