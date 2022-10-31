# Relax Helper

[简体中文](./README_CN.md) | English

The Goby plugin, developed using Vue + Bootstrap, currently has the following features.

- Exporting data from Goby scan jobs
- Scanning WEB systems with AWVS
- Scanning applications with FSCAN, weak passwords
- Exporting vulnerability data for AWVS, FSCAN scanning tasks
- Use FOFA information collection, **Note:**VIP required
- Add the IPs collected by FOFA to Goby's new scan task, **Note:**At present, you can only add one page, change the maximum search volume to 2000 pages, which is enough to use, right?

Translated with www.DeepL.com/Translator (free version)

**Note:**

- Export data is exported to the datadir directory of the plug-in folder by default
- Windows data directory: Goby installation directory\extensions\plugin number, plugin name\datadir
- Mac data directory: /Users/current username/goby/extensions/plugin number, plugin name/datadir

Project address: <https://github.com/0xn0ne/RelaxHelper>

## Quick Start

1. Install via the extension store
2. (Can be skipped) Configure AWVS or FOFA address, email, API key

    ![Untitled](./src/assets/images/Untitled.png)

3. Click on the icon in the right toolbar to open the Relax control panel

    ![Untitled](./src/assets/images/Untitled%201.png)

4. Start the operation

## Manual installation

### Dependencies

- nodejs v16+

### Operation steps

1. download the plugin file
2. Copy the file to Goby's extensions plugin directory
3. Go to the plugin directory and use the `npm install` command to install the plugin dependencies
4. Restart Goby and you are done

- Windows plugin directory: C:\Users\current username\goby\extensions\
- Mac plugin directory: /Users/current-username/goby/extensions/

## Function description

### Export function

![Untitled](./src/assets/images/Untitled%202.png)

This function is used for Goby scan job data export and requires access to the job panel before operation

1. Go to the task panel

    ![Untitled](./src/assets/images/Untitled%203.png)

2. Check the Export field as needed and click **Export Task Data** to export the current Goby scan data, the path will appear in the prompt box

    ![Untitled](./src/assets/images/Untitled%204.png)

3. Click **Save Configuration** to save all the exported and scanned current configurations, so you don't need to re-check them after reopening Relax.
The data will be exported in CSV and JSON format, and the data content is as follows

    ![Untitled](./src/assets/images/Untitled%205.png)

### Scanning function

![Untitled](./src/assets/images/Untitled%206.png)

This feature is used to link third-party tools to expand scanning capabilities, currently only the whole AWVS, FSCAN, you need to enter the task panel and then operate

1. Before use, you need to confirm the correct configuration of **AWVS API KEY**, **AWVS ADDRESS**, **FSCAN PATH** on the configuration page of Goby plug-in.
2. If the configuration is incorrect or AWVS or FSCAN cannot be connected, AWVS or FSCAN scanning cannot be started, so re-open Goby after reconfiguration.

    ![Untitled](./src/assets/images/Untitled%207.png)

3. Click **Submit Scan Job** to submit the current asset to the launched scanning system for scanning, it will automatically filter the http or https protocol ports to AWVS for scanning, the number of targets will be different from the number of assets

    ![Untitled](./src/assets/images/Untitled%208.png)

4. Here will display the progress of the scan and the number of vulnerabilities, each time you reopen the panel Relax will update the data once

    ![Untitled](./src/assets/images/Untitled%209.png)

5. Click **Clear All Targets** to clear all Targets in AWVS, FSCAN.**Note:**All Targets will be cleared whether they are added by Relax or not, and the scan results will also be cleared.
6. Click **Export Data** to export the current scan data of AWVS and FSCAN, you can also export the data during the scanning process, the export data is as follows

    ![Untitled](./src/assets/images/Untitled%2010.png)

### Search function

![Untitled](./src/assets/images/Untitled%2011.png)

This function is used to link third-party tools to start scanning tasks, currently only the entire FOFA, must be FOFA VIP to use the API

1. Before use, you need to confirm whether the configuration of **FOFA API KEY, FOFA EMAIL,** **FOFA ADDRESS** is correct.
2. If the configuration is correct, enter the search syntax and click search to load the results

    ![Untitled](./src/assets/images/Untitled%2012.png)

3. After selecting the search results, open Goby's **New Scan** task panel and click **Add Scan Target** to add the selected results to the Goby scan task panel

    ![Untitled](./src/assets/images/Untitled%2013.png)

### Remarks

- When doing the operation no pop-up prompt may indicate that the connection failed or something like that, check whether the configuration of AWVS or FOFA is correct or can be connected normally
- It's been a long time since I touched the code, it's a bit messy to write, I have a headache myself, I don't plan to get other functions yet
- This is a month to come up with something, do not expect too much
- If there are bugs, please raise Issues

## Operation demo

The file is too big too stupid, too lazy to update
