using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Data.Pdf;
using Windows.Storage;
using Windows.Storage.Streams;

class Program
{
    static void Main(string[] args)
    {
        try
        {
            RunAsync().GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.ToString());
        }
    }

    static async Task RunAsync()
    {
        string currentDir = Directory.GetCurrentDirectory();
        string pdfPath = Path.Combine(currentDir, @"revistas\entrevista-scind.pdf");
        string outDir = Path.Combine(currentDir, @"revistas\img");
        if (!Directory.Exists(outDir)) Directory.CreateDirectory(outDir);

        StorageFile file = await WindowsRuntimeSystemExtensions.AsTask<StorageFile>(StorageFile.GetFileFromPathAsync(pdfPath));
        PdfDocument doc = await WindowsRuntimeSystemExtensions.AsTask<PdfDocument>(PdfDocument.LoadFromFileAsync(file));
        StorageFolder folder = await WindowsRuntimeSystemExtensions.AsTask<StorageFolder>(StorageFolder.GetFolderFromPathAsync(outDir));

        Console.WriteLine("Total paginas: " + doc.PageCount);

        for (uint i = 0; i < doc.PageCount; i++)
        {
            using (PdfPage page = doc.GetPage(i))
            {
                string name = "pagina-" + (i + 1) + ".png";
                StorageFile outFile = await WindowsRuntimeSystemExtensions.AsTask<StorageFile>(folder.CreateFileAsync(name, CreationCollisionOption.ReplaceExisting));
                using (IRandomAccessStream stream = await WindowsRuntimeSystemExtensions.AsTask<IRandomAccessStream>(outFile.OpenAsync(FileAccessMode.ReadWrite)))
                {
                    PdfPageRenderOptions opt = new PdfPageRenderOptions();
                    opt.DestinationWidth = 1400;
                    await WindowsRuntimeSystemExtensions.AsTask<ulong>(page.RenderToStreamAsync(stream, opt));
                    await WindowsRuntimeSystemExtensions.AsTask<bool>(stream.FlushAsync());
                }
                Console.WriteLine("Renderizada pagina " + (i + 1));
            }
        }
        Console.WriteLine("FINALIZADO_EXITOSAMENTE");
    }
}
