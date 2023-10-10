import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner, CameraDirection } from '@capacitor-community/barcode-scanner';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.page.html',
  styleUrls: ['./qr-scan.page.scss'],
})
export class QrScanPage implements OnInit {
  scannedResult: string = "";
  isScanning = false;
  isSupported = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  async startScan() {
    
    this.isScanning = true;
    await BarcodeScanner.showBackground();

    // check for barcode-container and move it to a custom container
    const intervalCheckingDiv = setInterval(() => {
      const scannerDiv = document.getElementById('qrscanner');
      const barcodeDiv = document.body.querySelector("div:has(video)");
      const barcodeVideo = barcodeDiv?.querySelector("video");

      if(barcodeDiv){
        scannerDiv!.appendChild(barcodeVideo!);
        barcodeDiv?.remove();
        clearInterval(intervalCheckingDiv);
      }
    }, 50)

    const result = await BarcodeScanner.startScan({cameraDirection: CameraDirection.BACK});

    if (result.hasContent) {
      this.scannedResult = result.content;
      const parts = this.scannedResult.split('/');
      // get the last part of the url
      const codeId = parts[parts.length - 1];

      // TO DO route to /join
      console.log('Code erkannt:', codeId);
      console.log('Barcode data:', result.content);
      this.router.navigateByUrl(result.content)
    }
  }

  stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    // reload site
    window.location.reload();
  }

  closeScanner() {
    this.isScanning = true;
  }
}
